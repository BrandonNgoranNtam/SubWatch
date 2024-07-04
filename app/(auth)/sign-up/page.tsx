import AuthForm from "@/components/AuthForm";
import { getLoggedInUser } from "@/lib/actions/user.actions";
import React from "react";

const SignUp = async () => {
    try {
        return (
            <section className="flex-center size-full max-sm:px-6">
                <AuthForm type="sign-up" />
            </section>
        );
    } catch (error) {
        console.error("Error in SignUp function:", error);
        throw error;
    }
};


export default SignUp;