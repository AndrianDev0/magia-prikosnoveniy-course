import { notFound } from "next/navigation";
import Link from "next/link";
import legalData from "@/public/course/legal-documents.json";
import { SiteFooter } from "@/components/course/site-footer";
import { SiteHeader } from "@/components/course/site-header";
import { chatGPTSignInPath, chatGPTSignOutPath, getChatGPTUser } from "@/app/chatgpt-auth";
import { isAdminEmail } from "@/lib/authz";

type LegalParagraph = { type: "paragraph"; text: string; style?: string };
type LegalTable = { type: "table"; rows: string[][] };
type LegalDocument = { slug: string; title: string; blocks: Array<LegalParagraph | LegalTable> };

const documents = legalData.documents as Record<string, LegalDocument>;
const downloads: Record<string, string> = {
  offer: "/course/legal/01-publichnaya-oferta.docx",
  privacy: "/course/legal/02-politika-pd.docx",
  consent: "/course/legal/03-soglasie-pd.docx",
  "user-agreement": "/course/legal/04-polzovatelskoe-soglashenie.docx",
  "rules-18": "/course/legal/05-pravila-18-plus.docx",
  refunds: "/course/legal/06-pravila-vozvrata.docx",
  "testimonial-consent": "/course/legal/07-soglasie-na-otzyv.docx",
};

export const dynamic = "force-dynamic";
export function generateStaticParams() { return Object.keys(documents).map((slug) => ({ slug })); }

function LegalBlock({ block }: { block: LegalParagraph | LegalTable }) {
  if (block.type === "table") {
    const [head, ...body] = block.rows;
    return <div className="legal-table-wrap"><table className="legal-table"><thead><tr>{head.map((cell, index) => <th key={index}>{cell}</th>)}</tr></thead><tbody>{body.map((row, rowIndex) => <tr key={rowIndex}>{row.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}</tr>)}</tbody></table></div>;
  }
  if (/^\d+\.\s/.test(block.text) || /Heading/i.test(block.style ?? "")) return <h2>{block.text}</h2>;
  if (/^Редакция от/.test(block.text)) return <p className="legal-revision">{block.text}</p>;
  return <p>{block.text}</p>;
}

export default async function DocumentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const document = documents[slug];
  if (!document) notFound();
  const user = await getChatGPTUser();
  return (
    <div className="site-shell legal-page">
      <SiteHeader user={user ? { displayName: user.displayName } : null} signInPath={chatGPTSignInPath(`/documents/${slug}`)} signOutPath={chatGPTSignOutPath("/")} isAdmin={user ? isAdminEmail(user.email) : false} />
      <main className="legal-main section">
        <p className="eyebrow">Официальный документ · редакция 2.0</p>
        <h1 className="display-title">{document.title}</h1>
        <div className="legal-actions"><a className="button button-outline" href={downloads[slug]} download>Скачать DOCX</a><Link className="button button-outline" href="/">Вернуться на главную</Link></div>
        <article className="legal-document-content">{document.blocks.map((block, index) => <LegalBlock block={block} key={index} />)}</article>
        <div className="legal-actions legal-actions-bottom"><Link className="button button-outline" href="/">Вернуться на главную</Link></div>
      </main>
      <SiteFooter />
    </div>
  );
}
