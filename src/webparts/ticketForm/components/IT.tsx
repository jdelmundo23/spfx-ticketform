import * as React from "react";
import { useState } from "react";
import styles from "./TicketForm.module.scss";
import Urgency from "./Urgency";
import Upload from "./Upload";
import Choice from "./Choice";
import SearchUser from "./SearchUser";
import { IMember } from "@pnp/graph/members";
interface ITProps {
  hasTeamsContext: boolean;
  userDisplayName: string;
  userId: number;
  submitTicket: (
    title: string,
    ticketUserId: number,
    urgency: string,
    description: string,
    files: File[],
    department: string,
    branch: string,
    isoalted: boolean | undefined,
    status: string,
    resolution: string
  ) => Promise<void>;
  getFieldChoices: (listName: string, fieldName: string) => Promise<string[]>;
  resetForm: () => void;
  isSiteAdmin: boolean;
  getUsersFromGroup: (title: string) => Promise<IMember[]>;
  getUserID: (upn: string | undefined) => Promise<number>;
}

const IT: React.FC<ITProps> = ({
  hasTeamsContext,
  userDisplayName,
  userId,
  submitTicket,
  getFieldChoices,
  resetForm,
  isSiteAdmin,
  getUsersFromGroup,
  getUserID,
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
  
  const testInvalid = () : boolean => {
    if (!title || !description || !urgency || !department || !branch || isolated === undefined || ticketUserId === 0) {
      return true;
    }
    if (isSiteAdmin && !status) {
      return true;
    }
    if (status === 'Resolved' && !resolution) {
      return true;
    }
    return false;
  }

  const invalid = testInvalid();

  const formatDate = (date: Date): string => {
    const month = ("0" + (date.getMonth() + 1)).slice(-2);
    const day = ("0" + date.getDate()).slice(-2);
    const year = String(date.getFullYear()).slice(-2);

    return `${month}/${day}/${year}`;
  };

  return (
    <section
      className={`${styles.ticketForm} ${hasTeamsContext ? styles.teams : ""}`}
    >
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
                resolution
              );
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
              reboot the machine first.
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
              getUsersFromGroup={getUsersFromGroup}
              setTicketUserId={setTicketUserId}
              invalid={failedSubmit && ticketUserId === 0}
              getUserID={getUserID}
            />
          ) : (
            <p id="user">{userDisplayName}</p>
          )}
        </div>

        <Choice
          getChoices={getFieldChoices}
          choice={branch}
          setChoice={setBranch}
          invalid={failedSubmit && !branch}
          list={"IT"}
          field={"Branch"}
        />

        <Choice
          getChoices={getFieldChoices}
          choice={department}
          setChoice={setDepartment}
          invalid={failedSubmit && !department}
          list={"IT"}
          field={"Department"}
        />

        <div className={styles.radioDiv}>
          <label htmlFor="isoalted">
            Are others in your department experiencing the same issue?
          </label>
          <div
            className={styles.radioFlex}
            style={{ marginBottom: "0", justifyContent: "normal", gap: "10px" }}
          >
            <label
              htmlFor={"yes"}
              style={{
                width: "10%",
                height: "30px",
                borderRadius: "20px",
                ...(failedSubmit && isolated === undefined
                  ? { border: "1px solid red" }
                  : !isolated && isolated !== undefined
                  ? { border: "1px solid green", color: "green" }
                  : { border: "1px solid grey" }),
              }}
            >
              Yes
              <input
                id={"yes"}
                type="radio"
                name="isolated"
                value={"yes"}
                onChange={() => {
                  setIsolated(false);
                }}
              />
            </label>

            <label
              htmlFor={"no"}
              style={{
                width: "10%",
                height: "30px",
                borderRadius: "20px",
                ...(failedSubmit && isolated === undefined
                  ? { border: "1px solid red" }
                  : isolated && isolated !== undefined
                  ? { border: "1px solid red", color: "red" }
                  : { border: "1px solid grey" }),
              }}
            >
              No
              <input
                id={"no"}
                type="radio"
                name="isolated"
                value={"no"}
                onChange={() => {
                  setIsolated(true);
                }}
              />
            </label>
          </div>
        </div>

        <div>
          <label htmlFor="title">Title</label>
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

        <div>
          <label htmlFor="description">Description/Error Messages</label>
          <textarea
            style={failedSubmit && !description ? { borderColor: "red" } : {}}
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {isSiteAdmin && (
          <Choice
            getChoices={getFieldChoices}
            choice={status}
            setChoice={setStatus}
            invalid={failedSubmit && !status}
            list={"IT"}
            field={"Status"}
          />
        )}

        {status === "Resolved" ? (
          <div>
            <label htmlFor="resolution">Resolution</label>
            <textarea
              style={failedSubmit && !resolution ? { borderColor: "red" } : {}}
              id="resolution"
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
            />
          </div>
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
