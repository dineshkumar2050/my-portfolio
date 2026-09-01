import { createResumePdf, type ResumeType } from '@/lib/resumePdf';

async function downloadResume(type: ResumeType) {
  const resume = await createResumePdf(type);
  const blob = new Blob([resume.arrayBuffer], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = resume.fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export async function generateBasicResume() {
  await downloadResume('basic');
}

export async function generateDetailedResume() {
  await downloadResume('detailed');
}
