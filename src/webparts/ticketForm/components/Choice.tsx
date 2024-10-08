import * as React from "react";
import styles from "./TicketForm.module.scss";

interface ChoiceProps {
    getChoices: (listName: string, fieldName : string) => Promise<string[]>;
    choice: string;
    setChoice: (choice: string) => void;
    invalid: boolean;
    list: string;
    field: string;
}

const Choice: React.FC<ChoiceProps> = ({getChoices, choice, setChoice, invalid, list, field}) => {
    const [choices, setchoices] = React.useState<string[]>([]);
    const selectRef = React.useRef<HTMLSelectElement>(null);

    React.useEffect(() => {
        (async () => {
            try {
              const choices = await getChoices(list, field);
              setchoices(choices);
            } catch (error) {
              console.error("Error fetching data:", error);
            }
          })().catch((error) => console.error('Error in useEffect:', error));
    }, [])

    return (
        <div className={styles.deptDiv}>
            <label>{field}</label>
            <select style={invalid ? {borderColor: 'red'} : {}} ref={selectRef} value={choice} onChange={e => { setChoice(e.target.value); selectRef.current?.blur(); }}>
                <option value="" disabled selected hidden/>
                {choices.map(choice => <option key={choice} value={choice}>{choice}</option>)}
            </select>
        </div>
    )
}

export default Choice;