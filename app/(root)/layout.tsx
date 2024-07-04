import MobileNavBar from "@/components/MobileNavBar";
import Sidebar from "@/components/Sidebar";
import { getLoggedInUser } from "@/lib/actions/user.actions";
import Image from "next/image";
import { redirect } from "next/navigation";

/**
 * RootLayout component.
 * This component wraps all other components and sets the structure of the application.
 * It includes a sidebar and renders the main content of the app.
 *
 * @param {Object} props - The props object containing the children.
 * @param {React.ReactNode} props.children - The child components to render.
 * @returns {JSX.Element} - The RootLayout component.
 */
export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const loggedIn = await getLoggedInUser();
    if (!loggedIn) {
        redirect("/sign-in");
    }
    return (
        // The main container of the app
        <main className="flex h-screen w-full font-inter">
            <Sidebar user={loggedIn} />
            <div className="flex size-full flex-col">
                <div className="root-layout">
                    <Image src="/icons/logo.svg" alt="menu icon" width={30} height={30} />
                    <div>
                        <MobileNavBar user={loggedIn} />
                    </div>
                </div>
                {children}
            </div>
        </main>
    );
}

