import * as React from "react";
import styles from "./TicketForm.module.scss";
import { IMember } from "@pnp/graph/members";

interface Member extends  IMember {
  displayName?: string;
  userPrincipalName?: string;
  id?: string;
}

interface SearchUserProps {
  getUsersFromGroup: (title: string) => Promise<IMember[]>;
  setTicketUserId: (id: number) => void;
  invalid: boolean;
  getUserID: (upn: string | undefined) => Promise<number>;
}

const SearchUser: React.FC<SearchUserProps> = ({
  getUsersFromGroup,
  setTicketUserId,
  invalid,
  getUserID
}) => {
  const [siteUsers, setSiteUsers] = React.useState<Member[]>([]);
  const [filteredUsers, setFilteredUsers] = React.useState<Member[]>([]);
  const [search, setSearch] = React.useState<string | undefined>("");
  const [focused, setFocused] = React.useState<boolean>(false);
  const [validUser, setValidUser] = React.useState<boolean>(false);

  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    (async () => {
      setSiteUsers(await getUsersFromGroup("All Users"));
    })().catch((error) => console.error("Unhandled promise rejection:", error));
  }, []);

  const searchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearch(e.target.value);
    setFilteredUsers(
      siteUsers
        ?.filter((user) =>
          user?.displayName?.toLowerCase().includes(e.target.value.toLowerCase())
        )
        .slice(0, 4)
    );
    setValidUser(false);
    setTicketUserId(0);
  };

  return (
    <div className={styles.searchDiv}>
      <input
        style={invalid ? { borderColor: "red" } : {}}
        ref={inputRef}
        id="title"
        type="text"
        value={search}
        onChange={(e) => searchChange(e)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      <span>{validUser ? <p>✅</p> : <p>❌</p>}</span>
      {search && filteredUsers && focused && filteredUsers.length > 0 && (
        <ul>
          {filteredUsers.map(user => {
            if (user.userPrincipalName !== undefined) {
              return (
                <li
                  key={user.userPrincipalName}
                  onClick={async () => {
                    setTicketUserId(await getUserID(user.userPrincipalName));
                    inputRef.current?.blur();
                    setSearch(user.displayName);
                    setFilteredUsers([]);
                    setValidUser(true);
                  }}
                  onMouseDown={(e) => e.preventDefault()}
                >
                  {user.displayName}
                </li>
              )
            }
          })}
        </ul>
      )}
    </div>
  );
};

export default SearchUser;
