
/**
 * RootLayout component.
 * This component wraps all other components and sets the structure of the application.
 * It includes a sidebar and renders the main content of the app.
 *
 * @param {Object} props - The props object containing the children.
 * @param {React.ReactNode} props.children - The child components to render.
 * @returns {JSX.Element} - The RootLayout component.
 */
export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        // The main container of the app
        <main>
            {/* Sidebar */}
            SIDEBAR

            {/* Main content */}

            {children}
        </main>
    );
}

