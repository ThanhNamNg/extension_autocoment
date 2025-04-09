import * as vscode from 'vscode';
import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = "AIzaSyAx-kz0ympgBR4g9yxfYopvHl07Z5172Q4";

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand('vietnamese-commenter.commentCode', async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage("Không có file nào đang mở.");
      return;
    }

    const selection = editor.selection;
    const document = editor.document;
    const selectedCode = document.getText(selection);
    const languageId = document.languageId;

    if (!selectedCode.trim()) {
      vscode.window.showWarningMessage("Vui lòng chọn đoạn mã cần chú thích.");
      return;
    }

    const commentSyntax = getCommentSyntax(languageId);
    if (!commentSyntax) {
      vscode.window.showWarningMessage(`Không hỗ trợ kiểu comment cho ngôn ngữ: ${languageId}`);
      return;
    }

    const prompt = `
Bạn là chuyên gia lập trình. Hãy viết một đoạn chú thích ngắn gọn bằng tiếng Việt (1-3 dòng) mô tả chức năng hoặc mục đích của đoạn mã sau. 
Chỉ trả về phần chú thích (dưới dạng tiếng Việt thuần), không lặp lại đoạn mã nguồn.

### Ví dụ:

Input:
function sum(a, b) {
  return a + b;
}
Output:
Hàm tính tổng hai số và trả về kết quả.

Input:
for (let i = 0; i < 10; i++) {
  console.log(i);
}
Output:
Vòng lặp in ra các số từ 0 đến 9.

### Đoạn mã:
${selectedCode}
`;

    try {
      const commentText = await getGeneralComment(prompt);
      const commentedBlock = formatComment(commentText.trim(), commentSyntax) + '\n' + selectedCode;

      await editor.edit(editBuilder => {
        editBuilder.replace(selection, commentedBlock);
      });
    } catch (error: any) {
      vscode.window.showErrorMessage(`Lỗi khi gọi API: ${error.message}`);
    }
  });

  context.subscriptions.push(disposable);
}

function getCommentSyntax(languageId: string): { type: 'line' | 'block', open: string, close?: string } | null {
  const map: Record<string, { type: 'line' | 'block', open: string, close?: string }> = {
    javascript: { type: 'line', open: '// ' },
    typescript: { type: 'line', open: '// ' },
    python: { type: 'line', open: '# ' },
    java: { type: 'line', open: '// ' },
    c: { type: 'line', open: '// ' },
    cpp: { type: 'line', open: '// ' },
    csharp: { type: 'line', open: '// ' },
    php: { type: 'line', open: '// ' },
    ruby: { type: 'line', open: '# ' },
    shellscript: { type: 'line', open: '# ' },
    html: { type: 'block', open: '<!-- ', close: ' -->' },
    xml: { type: 'block', open: '<!-- ', close: ' -->' },
    css: { type: 'block', open: '/* ', close: ' */' },
    json: { type: 'block', open: '/* ', close: ' */' },
  };

  return map[languageId] || null;
}

function formatComment(text: string, syntax: { type: 'line' | 'block', open: string, close?: string }): string {
  if (syntax.type === 'line') {
    return syntax.open + text.replace(/\n/g, '\n' + syntax.open);
  } else {
    return syntax.open + text + (syntax.close || '');
  }
}

async function getGeneralComment(prompt: string): Promise<string> {
  if (!API_KEY) {
    throw new Error("⚠️ Missing API key. Please set API_KEY in your .env file.");
  }

  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = await response.text();

  return text;
}

export function deactivate() {}