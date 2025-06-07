import * as React from "react";

interface TextAreaProps {
  id: string;
  text: string;
  setText: (text: string) => void;
  invalid: boolean;
  field: string
}

const TextArea: React.FC<TextAreaProps> = ({ id, text, setText, invalid, field }) => {
  return (
    <div>
      <label htmlFor={id}>{field}</label>
      <textarea
        style={invalid ? { borderColor: "red" } : {}}
        id={id}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
    </div>
  );
};

export default TextArea;
