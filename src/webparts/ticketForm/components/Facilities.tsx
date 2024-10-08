import * as React from "react";
import styles from "./TicketForm.module.scss";
import { useState } from "react";
import Urgency from "./Urgency";
import Upload from "./Upload";
import Choice from "./Choice";
import { ISiteUserInfo } from "@pnp/sp/site-users/types";
import SearchUser from "./SearchUser";

interface FacilitiesProps {
  hasTeamsContext: boolean;
  userDisplayName: string;
  userId: number;
  submitFacTicket: (
    title: string,
    ticketUserId: number,
    priority: string,
    description: string,
    files: File[],
    branch: string
  ) => Promise<void>;
  getFieldChoices: (listName: string, fieldName: string) => Promise<string[]>;
  resetForm: () => void;
  isSiteAdmin: boolean;
  getSiteUsers: () => Promise<ISiteUserInfo[]>;
}

const Facilities: React.FC<FacilitiesProps> = ({
  hasTeamsContext,
  userDisplayName,
  userId,
  getFieldChoices,
  submitFacTicket,
  resetForm,
  isSiteAdmin,
  getSiteUsers,
}) => {
  const [title, setTitle] = useState<string>("");
  const [ticketUserId, setTicketUserId] = useState<number>(isSiteAdmin ? 0 : userId);
  const [description, setDescription] = useState<string>("");
  const [priority, setPriority] = useState<string>("");
  const [files, setFiles] = useState<File[]>([]);
  const [branch, setBranch] = useState<string>("");
  const [failedSubmit, setFailedSubmit] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const invalid = !title || !description || !priority || !branch || ticketUserId === 0;

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
          if (title && description && priority && branch) {
            try {
              setIsLoading(true);
              await submitFacTicket(
                title,
                ticketUserId,
                priority,
                description,
                files,
                branch
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
          Facilities Help Desk Ticket {isSiteAdmin ? "Admin Submission" : ""}
        </h1>

        <div>
          <label htmlFor="date">Date</label>
          <p id="date">{formatDate(new Date())}</p>
        </div>

        <div>
          <label htmlFor="user">User</label>
          {isSiteAdmin ? (
            <SearchUser
              getSiteUsers={getSiteUsers}
              setTicketUserId={setTicketUserId}
              invalid={failedSubmit && ticketUserId === 0}
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
          list={"Facilities"}
          field={"Branch"}
        />

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
          urgency={priority}
          setUrgency={setPriority}
          invalid={failedSubmit && !priority}
        />

        <div>
          <label htmlFor="description">Description</label>
          <textarea
            style={failedSubmit && !description ? { borderColor: "red" } : {}}
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

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

export default Facilities;
