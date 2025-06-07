import * as React from "react";
import styles from "../TicketForm.module.scss";
import { ChangeEvent, DragEvent, useState } from "react";

interface UploadProps {
    files: File[]
    setFiles: React.Dispatch<React.SetStateAction<File[]>>;
}

const Upload: React.FC<UploadProps> = ({files, setFiles}) => {
  const [sizeExceeded, setSizeExceeded] = useState<boolean>(false);
  const [isShaking, setIsShaking] = useState<boolean>(false);

  const handleShake = (): void => {
    setSizeExceeded(true);
    setIsShaking(true);

    setTimeout(() => {
      setIsShaking(false);
    }, 500);
    setTimeout(() => {
      setSizeExceeded(false);
    }, 2000);
  };

  const handleFiles = (files: FileList): void => {
    const fileList = files;
    if (fileList) {
      const newFiles: File[] = [];
      for (let i = 0; i < fileList.length; i++) {
        if (fileList[i].size < 20 * 1024 * 1024) {
          newFiles.push(fileList[i]);
        } else {
          if (!sizeExceeded) handleShake();
        }
      }
      setFiles((prevFiles) => [...prevFiles, ...newFiles]);
    }
  };

  const removeFile = (index: number): void => {
    setFiles(files.filter((file, i) => i !== index));
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const handleDrop = (e: DragEvent<HTMLLabelElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (event: DragEvent<HTMLLabelElement>): void => {
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <div className={styles.uploadDiv}>
      <p className={styles.instruction}>Please include any screenshots related to the issue or request below</p>
      <label htmlFor="upload" onDragOver={handleDragOver} onDrop={handleDrop} className={`${isShaking && styles.isShaking}`}>
        {files.length > 0 ? (
          <ul>
            {files.map((file, i) => {
              return (
                <li
                  key={i}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                >
                  {file.name}
                  <button
                    onClick={() => {
                      removeFile(i);
                    }}
                  >
                    <svg
                      fill="#000000"
                      height="9px"
                      width="9px"
                      version="1.1"
                      id="Capa_1"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 460.775 460.775"
                    >
                      <path
                        d="M285.08,230.397L456.218,59.27c6.076-6.077,6.076-15.911,0-21.986L423.511,4.565c-2.913-2.911-6.866-4.55-10.992-4.55
                    c-4.127,0-8.08,1.639-10.993,4.55l-171.138,171.14L59.25,4.565c-2.913-2.911-6.866-4.55-10.993-4.55
                    c-4.126,0-8.08,1.639-10.992,4.55L4.558,37.284c-6.077,6.075-6.077,15.909,0,21.986l171.138,171.128L4.575,401.505
                    c-6.074,6.077-6.074,15.911,0,21.986l32.709,32.719c2.911,2.911,6.865,4.55,10.992,4.55c4.127,0,8.08-1.639,10.994-4.55
                    l171.117-171.12l171.118,171.12c2.913,2.911,6.866,4.55,10.993,4.55c4.128,0,8.081-1.639,10.992-4.55l32.709-32.719
                    c6.074-6.075,6.074-15.909,0-21.986L285.08,230.397z"
                      />
                    </svg>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <p>Drag & Drop your files here or click to upload</p>
        )}
      </label>

      <p>{sizeExceeded ? "Failed to upload file(s). File size exceeds 20MB." : ""}</p>

      <input
        id="upload"
        type="file"
        multiple
        onChange={handleChange}
        style={{ display: "none" }}
      />
    </div>
  );
};

export default Upload;
