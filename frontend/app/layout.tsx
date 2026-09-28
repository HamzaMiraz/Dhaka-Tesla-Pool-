import "./styles.css";
export const metadata = { title: "Dhaka Tesla Pool", description: "Share a seat. Split the fare." };
export default function Layout({ children }: { children: React.ReactNode }) { return <html lang="en"><body><header><a href="/">⚡ Dhaka Tesla Pool</a><nav><a href="/passenger">Passenger</a><a href="/driver">Driver</a></nav></header>{children}</body></html>; }
