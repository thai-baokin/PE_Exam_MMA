const fs = require('fs');
const path = require('path');
const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } = require('docx');

// Student info
const studentCode = process.argv[2] || 'QE190108';
const fullName = process.argv[3] || 'Nguyễn Lê Thái Bảo';
const githubUrl = process.argv[4] || 'https://github.com/thai-baokin/PE_Exam_MMA';
const expoUrl = process.argv[5] || 'https://expo.dev/accounts/thaibao123/projects/bookshelf-app';
const projectId = process.argv[6] || 'pe-exam123';
const testEmail = process.argv[7] || 'grader.qe190108@example.com';
const testPassword = process.argv[8] || 'Test1234!';

const screenshotCaptions = [
  'Firebase console — Authentication: the Users list showing your test account.',
  'Firebase console — Firestore data: the movies collection with at least 3 sample documents belonging to your test account.',
  'Firebase console — Security Rules: the Rules tab showing the rules you actually have published, not just saved in an editor.',
  'Register screen — validation: the form submitted empty, showing the error messages.',
  'Register screen — success: right after a successful sign-up, showing Registration successful.',
  'Login screen: the empty sign-in form.',
  'List screen — after login: showing the user’s e-mail, the Logout button, and at least 3 movies already in the list.',
  'Add Movie form — validation: the form submitted empty or with bad input, showing the error messages.',
  'Add Movie form — success: right after adding a movie, showing Movie added and the new movie now in the list.',
  'Filters and search: the genre filter, the status filter, the favorites-only switch, and the search box each changing what is shown — one screenshot per control, or one screenshot plus a short note, is fine.',
  'Summary: movie-count, favorite-count and the status breakdown visible, with more than one status represented.',
  'Detail screen — view mode: one movie’s full details (title, director, genre, status, rating, notes).',
  'Detail screen — edit mode, validation: an edit submitted with bad input, showing the error messages.',
  'Detail screen — after Save: showing the edited values now saved.',
  'Favorite toggle and Delete: a before/after pair showing the star toggled, and a movie deleted and gone from the list.',
  'Empty state: the movies-empty screen with the text No movies found — easiest to capture with a second, fresh test account before it has any movies.',
];

const docChildren = [
  new Paragraph({
    text: 'PRACTICAL EXAM REPORT',
    heading: HeadingLevel.TITLE,
    alignment: AlignmentType.CENTER,
    spacing: { after: 200 },
  }),
  new Paragraph({
    children: [
      new TextRun({ text: 'Student Code: ', bold: true }),
      new TextRun({ text: studentCode }),
    ],
  }),
  new Paragraph({
    children: [
      new TextRun({ text: 'Full Name: ', bold: true }),
      new TextRun({ text: fullName }),
    ],
  }),
  new Paragraph({
    children: [
      new TextRun({ text: 'GitHub Repository URL: ', bold: true }),
      new TextRun({ text: githubUrl }),
    ],
  }),
  new Paragraph({
    children: [
      new TextRun({ text: 'Expo Project Link: ', bold: true }),
      new TextRun({ text: expoUrl }),
    ],
  }),
  new Paragraph({
    children: [
      new TextRun({ text: 'Firebase Project ID: ', bold: true }),
      new TextRun({ text: projectId }),
    ],
  }),
  new Paragraph({
    children: [
      new TextRun({ text: 'Test account email: ', bold: true }),
      new TextRun({ text: testEmail }),
    ],
  }),
  new Paragraph({
    children: [
      new TextRun({ text: 'Test account password: ', bold: true }),
      new TextRun({ text: testPassword }),
    ],
    spacing: { after: 300 },
  }),
  new Paragraph({
    text: 'SCREENSHOTS',
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 200, after: 200 },
  }),
];

screenshotCaptions.forEach((caption, index) => {
  docChildren.push(
    new Paragraph({
      children: [
        new TextRun({ text: `${index + 1}. `, bold: true }),
        new TextRun({ text: caption, bold: true, italics: true }),
      ],
      spacing: { before: 150, after: 100 },
    })
  );
  docChildren.push(
    new Paragraph({
      children: [
        new TextRun({
          text: '[DÁN ẢNH CHỤP MÀN HÌNH TƯƠNG ỨNG VÀO ĐÂY]',
          color: '888888',
          italics: true,
        }),
      ],
      border: {
        bottom: { style: BorderStyle.DASHED, size: 1, color: 'CCCCCC' },
        top: { style: BorderStyle.DASHED, size: 1, color: 'CCCCCC' },
        left: { style: BorderStyle.DASHED, size: 1, color: 'CCCCCC' },
        right: { style: BorderStyle.DASHED, size: 1, color: 'CCCCCC' },
      },
      spacing: { after: 200 },
      alignment: AlignmentType.CENTER,
    })
  );
});

const doc = new Document({
  sections: [{
    properties: {},
    children: docChildren,
  }],
});

const outputDir = path.join(__dirname, '..', 'submission', studentCode);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const outputPath = path.join(outputDir, `${studentCode}.docx`);
const fallbackPath = path.join(outputDir, `${studentCode}_CineList.docx`);

Packer.toBuffer(doc).then((buffer) => {
  try {
    fs.writeFileSync(outputPath, buffer);
    console.log(`Report created successfully at: ${outputPath}`);
  } catch (writeErr) {
    if (writeErr.code === 'EBUSY') {
      fs.writeFileSync(fallbackPath, buffer);
      console.warn(`File ${outputPath} is currently open in Word. Created fallback at: ${fallbackPath}. Please close Word and rename or rerun to overwrite.`);
    } else {
      throw writeErr;
    }
  }
}).catch((err) => {
  console.error('Failed to create docx:', err);
  process.exit(1);
});
