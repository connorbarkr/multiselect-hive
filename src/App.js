import Dropdown from "./Dropdown";

import "./styles/App.scss";
import { useState, useRef } from "react";

const multiselectPlaceholder = "Select one or more values";

const generateOptions = (length) => {
    const options = [];
    for (let i = 0; i < length; i++) {
        options.push({ id: i, label: `Option ${i}`, value: `option_${i}` });
    }
    return options;
};

const App = () => {
    const options = generateOptions(10);
    const [value, setValue] = useState(null);
    const [values, setValues] = useState(null);
    const multiselectRef = useRef(null);

    return (
        <div className="demo-container">
            <header className="demo-header">
                <Dropdown
                    options={options}
                    selected={value}
                    onChange={setValue}
                />
                <Dropdown
                    ref={multiselectRef}
                    multiselect
                    placeholder={multiselectPlaceholder}
                    options={options}
                    selected={values}
                    onChange={setValues}
                    closeOnClick={false}
                />
            </header>
        </div>
    );
};

export default App;
