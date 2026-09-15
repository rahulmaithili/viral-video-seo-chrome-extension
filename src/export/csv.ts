import { VideoJob } from '../types/queue';

function escapeCSV(val: unknown): string {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

export function exportBatchToCSV(jobs: VideoJob[]): void {
  const headers = [
    'Video ID',
    'Filename',
    'Category',
    'Niche',
    'Best Title',
    'Caption',
    'Description',
    'Tags',
    'Hashtags',
    'Keywords',
    'Viral Score',
    'Language',
    'Target USA',
    'Platforms',
    'Status',
    'Duplicate Score',
  ];

  const rows = jobs.map((j) => {
    const title = j.platformPackage?.youtube.bestTitle || j.platformPackage?.facebook.headline || '';
    const caption = j.platformPackage?.facebook.caption || j.platformPackage?.instagram.caption || '';
    const desc = j.platformPackage?.youtube.shortDescription || '';
    const tags = j.platformPackage?.youtube.tags?.join(', ') || '';
    const hashtags = j.platformPackage?.youtube.hashtags?.join(' ') || '';
    const keywords = j.analysis?.keywords?.map((k) => k.term).join(', ') || '';
    const score = j.analysis?.viralScore?.overallScore ?? '';
    const dupScore = j.duplicateInfo?.score ?? '';

    return [
      escapeCSV(j.id),
      escapeCSV(j.filename),
      escapeCSV(j.analysis?.category || ''),
      escapeCSV(j.analysis?.niche || ''),
      escapeCSV(title),
      escapeCSV(caption),
      escapeCSV(desc),
      escapeCSV(tags),
      escapeCSV(hashtags),
      escapeCSV(keywords),
      escapeCSV(score),
      escapeCSV(j.language),
      escapeCSV(j.targetUsa ? 'YES' : 'NO'),
      escapeCSV(j.selectedPlatforms.join('; ')),
      escapeCSV(j.status),
      escapeCSV(dupScore),
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `viral_video_ai_export_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
