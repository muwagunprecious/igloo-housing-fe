import PostUtmeNavbar from "@/app/components/layout/PostUtmeNavbar";

export const metadata = {
    title: "Post-UTME Housing | Igloo",
    description: "Find temporary accommodation near OOU for your Post-UTME examination.",
};

export default function PostUtmeLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-white">
            <PostUtmeNavbar />
            {children}
        </div>
    );
}
