import { ISiteUserInfo } from "@pnp/sp/site-users/types";
import * as React from "react";
import styles from "./TicketForm.module.scss";

interface SearchUserProps {
  getSiteUsers: () => Promise<ISiteUserInfo[]>;
  setTicketUserId: (id: number) => void;
  invalid: boolean;
}

const SearchUser: React.FC<SearchUserProps> = ({
  getSiteUsers,
  setTicketUserId,
  invalid
}) => {
  const [siteUsers, setSiteUsers] = React.useState<ISiteUserInfo[]>();
  const [filteredUsers, setFilteredUsers] = React.useState<ISiteUserInfo[]>();
  const [search, setSearch] = React.useState<string>("");
  const [focused, setFocused] = React.useState<boolean>(false);
  const [validUser, setValidUser] = React.useState<boolean>(false);

  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    (async () => {
      setSiteUsers(await getSiteUsers());
    })().catch((error) => console.error("Unhandled promise rejection:", error));
  }, []);

  const searchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearch(e.target.value);
    setFilteredUsers(
      siteUsers
        ?.filter((user) =>
          user.Title.toLowerCase().includes(e.target.value.toLowerCase())
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
          {filteredUsers.map((user) => (
            <li
              key={user.UserPrincipalName}
              onClick={() => {
                setTicketUserId(user.Id);
                inputRef.current?.blur();
                setSearch(user.Title);
                setFilteredUsers([]);
                setValidUser(true);
              }}
              onMouseDown={(e) => e.preventDefault()}
            >
              {user.Title}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchUser;
