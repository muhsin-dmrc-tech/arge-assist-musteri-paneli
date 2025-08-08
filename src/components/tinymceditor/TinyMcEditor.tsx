import React from 'react';
import { Editor } from '@tinymce/tinymce-react';
interface TinyMcEditorProps {
  content: string;
  setContent: (content: string) => void;
}
function TinyMcEditor({ content, setContent }: TinyMcEditorProps) {

  const handleEditorChange = (content: string) => {
    setContent(content);
  };
  return (
    <div>
      <Editor
        apiKey='uv8r54j6r5jkgzredzftv0bhduojgt79mgkq57u1n34gyq81'
        value={content}
        onEditorChange={handleEditorChange}
        init={{
          height: 500,
          menubar: false,
          plugins: [
            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
            'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount', 'image'
          ],
          toolbar: 'undo redo | blocks | code | image | link |' +
            'bold italic forecolor | alignleft aligncenter ' +
            'alignright alignjustify | bullist numlist outdent indent | ' +
            'removeformat | help',
          content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
          appendTo: 'body',
          fixed_toolbar_container: 'body',
          paste_as_text: false,
        }}
      />
    </div>

  );
}

export default TinyMcEditor;
