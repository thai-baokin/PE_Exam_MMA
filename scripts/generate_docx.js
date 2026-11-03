const fs = require('fs');
const path = require('path');
const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } = require('docx');

// Get student code from CLI arguments or use default template
const studentCode = process.argv[2] || 'QE200012';
const fullName = process.argv[3] || 'Nguyen Van A';
const githubUrl = process.argv[4] || 'https://github.com/thai-baokin/PE_Exam_MMA';
const expoUrl = process.argv[5] || 'https://expo.dev/accounts/thaibao123/projects/bookshelf-app/builds/xxxxxxxx';
const projectId = process.argv[6] || 'pe-exam123';
const testEmail = process.argv[7] || `grader.${studentCode.toLowerCase()}@example.com`;
const testPassword = process.argv[8] || 'Test1234!';

const screenshotCaptions = [
  'Firebase console — Authentication: the Users list showing your test account.',
  'Firebase console — Firestore data: the books collection with at least 3 sample documents belonging to your test account.',
  'Firebase console — Security Rules: the Rules tab showing the rules you actually have published, not just saved in an editor.',
  'Register screen — validation: the form submitted empty, showing the error messages.',
  'Register screen — success: right after a successful sign-up, showing Registration successful.',
  'Login screen: the empty sign-in form.',
  'List screen — after login: showing the user’s e-mail, the Logout button, and at least 3 books already in the list.',
  'Add Book form — validation: the form submitted empty or with bad input, showing the error messages.',
  'Add Book form — success: right after adding a book, showing Book added and the new book now in the list.',
  'Filters and search: the genre filter, the status filter, the favorites-only switch, and the search box each changing what is shown — one screenshot per control, or one screenshot plus a short note, is fine.',
  'Summary: book-count, favorite-count and the status breakdown visible, with more than one status represented.',
  'Detail screen — view mode: one book’s full details (title, author, genre, status, rating, notes).',
  'Detail screen — edit mode, validation: an edit submitted with bad input, showing the error messages.',
  'Detail screen — after Save: showing the edited values now saved.',
  'Favorite toggle and Delete: a before/after pair showing the star toggled, and a book deleted and gone from the list.',
  'Empty state: the books-empty screen with the text No books found — easiest to capture with a second, fresh test account before it has any books.',
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
    spacing: { after: 400 },
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
      text: `${index + 1}. ${caption}`,
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 250, after: 100 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: `[Dán ảnh chụp màn hình cho: "${caption}" vào đây]`,
          italics: true,
          color: '888888',
        }),
      ],
      spacing: { after: 300 },
    })
  );
});

const doc = new Document({
  sections: [
    {
      properties: {},
      children: docChildren,
    },
  ],
});

// Output directory
const outputDir = path.join(__dirname, '..', 'submission', studentCode);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const outputPath = path.join(outputDir, `${studentCode}.docx`);

Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync(outputPath, buffer);
  console.log(`✅ Word report template created successfully at: ${outputPath}`);
});

