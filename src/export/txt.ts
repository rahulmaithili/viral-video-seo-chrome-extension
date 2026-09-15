import { VideoJob } from '../types/queue';

export function exportJobToTXT(job: VideoJob): void {
  if (!job.platformPackage) return;
  const pkg = job.platformPackage;

  const content = `===============================================================
RAHUL SCRIPTS — VIRAL VIDEO AI STUDIO METADATA PACKAGE
===============================================================
File: ${job.filename}
Category: ${job.analysis?.category || 'N/A'}
Niche: ${job.analysis?.niche || 'N/A'}
Viral Score: ${job.analysis?.viralScore.overallScore ?? 'N/A'} / 100
Language: ${job.language}
Target USA: ${job.targetUsa ? 'ON' : 'OFF'}
Export Date: ${new Date().toLocaleString()}

---------------------------------------------------------------
1. CANONICAL VIDEO FACTS
---------------------------------------------------------------
Subject: ${job.analysis?.facts.subject}
Action: ${job.analysis?.facts.action}
Setting: ${job.analysis?.facts.setting}
Emotions: ${job.analysis?.facts.emotions.join(', ')}
Location: ${job.analysis?.facts.location || 'None established'}

---------------------------------------------------------------
2. YOUTUBE OPTIMIZATION
---------------------------------------------------------------
BEST TITLE:
${pkg.youtube.bestTitle}

ALL CANDIDATE TITLES:
${pkg.youtube.titleCandidates.map((t, i) => `${i + 1}. [Score: ${t.overallScore}] ${t.title}`).join('\n')}

HOOK:
${pkg.youtube.hook}

SHORT DESCRIPTION:
${pkg.youtube.shortDescription}

SEO / LONG DESCRIPTION:
${pkg.youtube.longDescription}

TAGS:
${pkg.youtube.tags.join(', ')}

HASHTAGS:
${pkg.youtube.hashtags.join(' ')}

KEYWORDS:
${job.analysis?.keywords.map((k) => k.term).join(', ')}

---------------------------------------------------------------
3. FACEBOOK OPTIMIZATION
---------------------------------------------------------------
HEADLINE:
${pkg.facebook.headline}

CAPTION:
${pkg.facebook.caption}

ENGAGEMENT PROMPT:
${pkg.facebook.engagementPrompt}

---------------------------------------------------------------
4. INSTAGRAM OPTIMIZATION
---------------------------------------------------------------
REEL HOOK:
${pkg.instagram.reelHook}

FIRST LINE:
${pkg.instagram.firstLine}

CAPTION:
${pkg.instagram.caption}

HASHTAGS:
${pkg.instagram.hashtags.join(' ')}

===============================================================
Generated with Rahul Scripts Viral Video AI Studio
`;

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${job.filename.replace(/\.[^/.]+$/, '')}_metadata.txt`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
