import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/auth-helpers";
import { buildCvData, cvDownloadFilename, getCvWithSelections } from "@/lib/cvs";
import { generateCvDocx } from "@/lib/cv-docx";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  let userId: string;
  try {
    userId = await requireUserId();
  } catch {
    return new NextResponse("Non authentifié.", { status: 401 });
  }

  const [cv, data] = await Promise.all([
    getCvWithSelections(userId, id),
    buildCvData(userId, id),
  ]);
  if (!cv || !data) return new NextResponse("CV introuvable.", { status: 404 });

  const buffer = await generateCvDocx(data);

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${cvDownloadFilename(cv.name)}"`,
    },
  });
}
