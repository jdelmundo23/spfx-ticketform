import * as React from "react";
import { useState } from "react";
import styles from "../TicketForm.module.scss";
import Urgency from "../form_components/Urgency";
import Upload from "../form_components/Upload";
import Choice from "../form_components/Choice";
import SearchUser from "../form_components/SearchUser";
import { submitTicket } from "../../api/submit";
import APIContext from "../../context/APIContext";
import TextArea from "../form_components/TextArea";
import { formatDate } from "../../api/util";
import YesNo from "../form_components/YesNo";

interface ITProps {
  userDisplayName: string;
  userId: number;
  resetForm: () => void;
  completeForm: () => void;
  isSiteAdmin: boolean;
}

const IT: React.FC<ITProps> = ({
  userDisplayName,
  userId,
  resetForm,
  completeForm,
  isSiteAdmin,
}) => {
  const [title, setTitle] = useState<string>("");
  const [ticketUserId, setTicketUserId] = useState<number>(
    isSiteAdmin ? 0 : userId
  );
  const [urgency, setUrgency] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [failedSubmit, setFailedSubmit] = useState<boolean>(false);
  const [files, setFiles] = useState<File[]>([]);
  const [department, setDepartment] = useState<string>("");
  const [branch, setBranch] = useState<string>("");
  const [isolated, setIsolated] = useState<boolean | undefined>(undefined);
  const [status, setStatus] = useState<string>("");
  const [resolution, setResolution] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const api = React.useContext(APIContext);

  const testInvalid = (): boolean => {
    if (
      !title ||
      !description ||
      !urgency ||
      !department ||
      !branch ||
      isolated === undefined ||
      ticketUserId === 0
    ) {
      return true;
    }
    if (isSiteAdmin && !status) {
      return true;
    }
    if (status === "Resolved" && !resolution) {
      return true;
    }
    return false;
  };

  const invalid = testInvalid();

  return (
    <section className={`${styles.ticketForm}`}>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (!invalid) {
            try {
              setIsLoading(true);
              await submitTicket(
                title,
                ticketUserId,
                urgency,
                description,
                files,
                department,
                branch,
                isolated,
                status,
                resolution,
                api?.sp
              );
              completeForm();
            } catch (error) {
              console.error(error);
            } finally {
              setIsLoading(false);
            }
          } else {
            setFailedSubmit(true);
          }
        }}
      >
        <h1>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            height="0.6em"
            width="0.6em"
            version="1.1"
            id="Layer_1"
            viewBox="0 0 330 330"
            className={styles.titleArrow}
            onClick={resetForm}
          >
            <path
              id="XMLID_222_"
              d="M250.606,154.389l-150-149.996c-5.857-5.858-15.355-5.858-21.213,0.001  c-5.857,5.858-5.857,15.355,0.001,21.213l139.393,139.39L79.393,304.394c-5.857,5.858-5.857,15.355,0.001,21.213  C82.322,328.536,86.161,330,90,330s7.678-1.464,10.607-4.394l149.999-150.004c2.814-2.813,4.394-6.628,4.394-10.606  C255,161.018,253.42,157.202,250.606,154.389z"
            />
          </svg>
          IT Help Desk Ticket {isSiteAdmin ? "Admin Submission" : ""}
        </h1>

        {isSiteAdmin ? (
          ""
        ) : (
          <>
            <p className={styles.rebootMsg}>
              If you are having an application or hardware related issue, please
              <i> reboot</i> the machine first.
            </p>
            <br />
          </>
        )}

        <div>
          <label htmlFor="date">Date</label>
          <p id="date">{formatDate(new Date())}</p>
        </div>

        <div>
          <label htmlFor="user">User</label>
          {isSiteAdmin ? (
            <SearchUser
              setTicketUserId={setTicketUserId}
              invalid={failedSubmit && ticketUserId === 0}
            />
          ) : (
            <p id="user">{userDisplayName}</p>
          )}
        </div>

        <Choice
          choice={branch}
          setChoice={setBranch}
          invalid={failedSubmit && !branch}
          list={"IT"}
          field={"Branch"}
        />

        <Choice
          choice={department}
          setChoice={setDepartment}
          invalid={failedSubmit && !department}
          list={"IT"}
          field={"Department"}
        />

        <YesNo
          field={"Are others in your department experiencing the same issue?"}
          id={"isolated"}
          value={isolated}
          setValue={setIsolated}
          failedSubmit={failedSubmit}
        />

        <div>
          <label htmlFor="title">Issue Title</label>
          <input
            style={failedSubmit && !title ? { borderColor: "red" } : {}}
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <Urgency
          urgency={urgency}
          setUrgency={setUrgency}
          invalid={failedSubmit && !urgency}
        />

        <TextArea
          id={"description"}
          text={description}
          setText={setDescription}
          invalid={failedSubmit && !description}
          field={"Description/Error Messages"}
        />

        {isSiteAdmin && (
          <Choice
            choice={status}
            setChoice={setStatus}
            invalid={failedSubmit && !status}
            list={"IT"}
            field={"Status"}
          />
        )}

        {status === "Resolved" ? (
          <TextArea
            id={"resolution"}
            text={resolution}
            setText={setResolution}
            invalid={failedSubmit && !resolution}
            field={"Resolution"}
          />
        ) : (
          ""
        )}

        <Upload files={files} setFiles={setFiles} />

        <div className={styles.submitDiv}>
          <button
            type="submit"
            disabled={isLoading}
            style={
              isLoading
                ? {
                    opacity: "0.5",
                    cursor: "not-allowed",
                    pointerEvents: "none",
                  }
                : {}
            }
          >
            SUBMIT
          </button>
          <p>{invalid && failedSubmit && "Please fill in all fields."}</p>
          {isLoading ? <span className={styles.spinner} /> : <></>}
        </div>
      </form>
    </section>
  );
};

export default IT;
