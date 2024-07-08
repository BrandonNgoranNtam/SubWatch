"use server"

import {cookies} from "next/headers"
import {createAdminClient, createSessionClient} from "../appwrite"
import {ID, Query} from "node-appwrite"
import {encryptId, extractCustomerIdFromUrl, parseStringify} from "../utils"
import {CountryCode, ProcessorTokenCreateRequest, ProcessorTokenCreateRequestProcessorEnum, Products} from "plaid"
import {plaidClient} from "../plaid"
import {revalidatePath} from "next/cache"
import {addFundingSource, createDwollaCustomer} from "./dwolla.actions"

const {
    APPWRITE_DATABASE_ID: DATABASE_ID,
    APPWRITE_USER_COLLECTION_ID: USER_COLLECTION_ID,
    APPWRITE_BANK_COLLECTION_ID: BANK_COLLECTION_ID,
} = process.env;

export const getUserInfo = async ({userId}: getUserInfoProps) => {
    try {
        const {database} = await createAdminClient();
        const user = await database.listDocuments(DATABASE_ID!, USER_COLLECTION_ID!, [Query.equal('userId', [userId])]);
        return parseStringify(user.documents[0]);
    } catch (error) {
        console.error("An error occurred while getting user info:", error);
    }
}

export const signIn = async ({email, password}: signInProps) => {
    try {
        const {account} = await createAdminClient();

        const session = await account.createEmailPasswordSession(email, password);

        cookies().set("appwrite-session", session.secret, {
            path: "/",
            httpOnly: true,
            sameSite: "strict",
            secure: true,
        });
         const user = await getUserInfo({userId: session.userId});

        return parseStringify(user);

    } catch (error) {
        console.log('Error', error)
    }

}


export const signUp = async ({password, ...userData}: SignUpParams) => {

    const {email, firstName, lastName} = userData;
    let newUserAccount;
    try {

        const {account, database} = await createAdminClient();

        newUserAccount = await account.create(ID.unique(), email, password, `${firstName} ${lastName}`);

        if (!newUserAccount) {
            throw new Error('Error creating user account')
        }

        const dwollaCustomerUrl = await createDwollaCustomer({
            ...userData,
            type: "personal",
        })


        if (!dwollaCustomerUrl) {
            throw new Error('Error creating Dwolla customer')
        }

        const dwollaCustomerId = extractCustomerIdFromUrl(dwollaCustomerUrl);

        const newUser = await database.createDocument(DATABASE_ID!, USER_COLLECTION_ID!, ID.unique(), {
            ...userData,
            userId: newUserAccount.$id,
            dwollaCustomerId,
            dwollaCustomerUrl,
        })

        const session = await account.createEmailPasswordSession(email, password);

        cookies().set("appwrite-session", session.secret, {
            path: "/",
            httpOnly: true,
            sameSite: "strict",
            secure: true,
        });

        return parseStringify(newUser);

    } catch (error) {
        console.log('Error', error)
    }

}


// ... your initilization functions

export async function getLoggedInUser() {
    try {
        const {account} = await createSessionClient();
        const result = await account.get();
        const user  =  await getUserInfo({userId: result.$id});
        return parseStringify(user);
    } catch (error) {
        return null;
    }
}


export const logoutAccount = async () => {
    try {
        const {account} = await createSessionClient();
        cookies().delete("appwrite-session");
        await account.deleteSession("current");
    } catch (error) {
        return null;

    }
}


/**
 * Creates a Plaid link token for the given user.
 *
 * @param {User} user - The user object.
 * @returns {Promise<{ linkToken: string }>} - A promise that resolves to an object with the link token.
 * @throws {Error} - If there is an error creating the link token.
 */
export const createLinkToken = async (user: User) => {
    try {
        // Define the parameters for creating a link token.
        const tokenParams = {
            user: {
                client_user_id: user.$id, // The client user ID.
            },
            client_name: `${user.firstName} ${user.lastName}`, // The client name.
            products: ['auth'] as Products[], // The products to include in the link token.
            language: 'en', // The language of the link token.
            country_codes: ['US', "CA", "GB", "BE"] as CountryCode[], // The country codes for the link token.
        }

        // Create the link token using the Plaid client.
        const response = await plaidClient.linkTokenCreate(tokenParams);

        // Return the link token in a parsed object.
        return parseStringify({linkToken: response.data.link_token});

    } catch (error) {
        // Handle any errors that occur during the creation of the link token.
    }
}

export const createBankAccount = async ({
                                            userId, bankId, accountId, accessToken, fundingSourceUrl, shareableId
                                        }: createBankAccountProps) => {

    try {
        console.log("Creating bank account...");
        console.log("User ID:", userId);
        console.log("Bank ID:", bankId);
        console.log("Account ID:", accountId);
        console.log("Access Token:", accessToken);
        console.log("Funding Source URL:", fundingSourceUrl);
        console.log("Shareable ID:", shareableId);

        const {database} = await createAdminClient();
        console.log("Admin client created successfully.");

        const bankAccount = await database.createDocument(
            DATABASE_ID!,
            BANK_COLLECTION_ID!,
            ID.unique(),
            {
                userId,
                bankId,
                accountId,
                accessToken,
                fundingSourceUrl,
                shareableId
            }
        );
        console.log('Created bank account:', bankAccount);

        return parseStringify(bankAccount);

    } catch (error) {
        console.error("An error occurred while creating a bank account:", error);
    }

}

export const exchangePublicToken = async ({
                                              publicToken,
                                              user,
                                          }: exchangePublicTokenProps) => {
    try {
        // Exchange public token for access token and item ID
        console.log("Exchanging public token for access token and item ID");
        const response = await plaidClient.itemPublicTokenExchange({
            public_token: publicToken,
        });

        const accessToken = response.data.access_token;
        const itemId = response.data.item_id;

        // Get account information from Plaid using the access token
        console.log("Getting account information from Plaid using the access token");
        const accountsResponse = await plaidClient.accountsGet({
            access_token: accessToken,
        });

        const accountData = accountsResponse.data.accounts[0];

        // Create a processor token for Dwolla using the access token and account ID
        console.log("Creating a processor token for Dwolla using the access token and account ID");
        const request: ProcessorTokenCreateRequest = {
            access_token: accessToken,
            account_id: accountData.account_id,
            processor: "dwolla" as ProcessorTokenCreateRequestProcessorEnum,
        };

        const processorTokenResponse = await plaidClient.processorTokenCreate(request);
        const processorToken = processorTokenResponse.data.processor_token;

        // Create a funding source URL for the account using the Dwolla customer ID, processor token, and bank name
        console.log("Creating a funding source URL for the account using the Dwolla customer ID, processor token, and bank name");
        const fundingSourceUrl = await addFundingSource({
            dwollaCustomerId: user.dwollaCustomerId,
            processorToken,
            bankName: accountData.name,
        });

        // If the funding source URL is not created, throw an error
        if (!fundingSourceUrl) throw Error;

        // Create a bank account using the user ID, item ID, account ID, access token, funding source URL, and shareableId ID
        console.log("Creating a bank account using the user ID, item ID, account ID, access token, funding source URL, and shareableId ID");
        await createBankAccount({
            userId: user.$id,
            bankId: itemId,
            accountId: accountData.account_id,
            accessToken,
            fundingSourceUrl,
            shareableId: encryptId(accountData.account_id),
        });

        // Revalidate the path to reflect the changes
        revalidatePath("/");

        // Return a success message
        console.log("Public token exchange complete");
        return parseStringify({
            publicTokenExchange: "complete",
        });
    } catch (error) {
        console.error("An error occurred while exchanging token:", error);
    }
}


export const getBanks = async ({userId}: getBanksProps) => {
    try {
        const {database} = await createAdminClient();
        const bankAccounts = await database.listDocuments(DATABASE_ID!, BANK_COLLECTION_ID!, [
            Query.equal("userId", [userId]),
        ]);
        return parseStringify(bankAccounts.documents);
    } catch (error) {
        console.error("An error occurred while getting bank accounts:", error);
    }
}

export const getBank = async ({documentId}: getBankProps) => {
    try {
        const {database} = await createAdminClient();
        const bankAccount = await database.listDocuments(DATABASE_ID!, BANK_COLLECTION_ID!, [
            Query.equal("$id", [documentId]),
        ]);
        return parseStringify(bankAccount.documents[0]);
    } catch (error) {
        console.error("An error occurred while getting bank accounts:", error);
    }
}

export const getBankByAccountId = async ({accountId}: getBankByAccountIdProps) => {
    try {
        const {database} = await createAdminClient();
        const bankAccount = await database.listDocuments(DATABASE_ID!, BANK_COLLECTION_ID!, [
            Query.equal("accountId", [accountId]),
        ]);
        if (bankAccount.total !== 1) return null;
        return parseStringify(bankAccount.documents[0]);
    } catch (error) {
        console.error("An error occurred while getting bank accounts:", error);
    }
}