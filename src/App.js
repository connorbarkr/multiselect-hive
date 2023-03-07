import Dropdown from "./Dropdown";

import "./styles/App.scss";
import { useState } from "react";
import { useCallback } from "react";

const generateOptions = (length) => {
    const options = [];
    for (let i = 0; i < length; i++) {
        options.push({ id: i, label: `Option ${i}`, value: `option_${i}` });
    }
    return options;
};

const App = () => {
    const options10 = generateOptions(10);
    const options100000 = generateOptions(100000);
    const [value, setValue] = useState(null);
    const [values, setValues] = useState([]);
    const [value_1, setValue_1] = useState(null);
    const [values_1, setValues_1] = useState([]);
    const [value_2, setValue_2] = useState(null);
    const [values_2, setValues_2] = useState([]);
    const [disabled, setDisabled] = useState(true);
    const [placeholder, setPlaceholder] = useState("Placeholder");

    const options_faulty = generateOptions(10);
    options_faulty.push({
        id: 9,
        label: `Option ${9}`,
        value: `option_${9}`,
    });

    const toggleDisabled = useCallback(() => {
        setDisabled((prev) => !prev);
    }, []);

    const handlePlaceholderChange = useCallback((e) => {
        setPlaceholder(e.target.value);
    }, []);

    return (
        <div className="demo-container">
            <header className="demo-header">
                <div className="label">Hive Dropdown Demo</div>
            </header>
            <div className="demo-section">
                <p>
                    These are the two basic components: a single and a
                    multiselect dropdown. Both components can have their values
                    cleared immediately, and the multiselect can have all of its
                    values selected simultaneously. Note that clicking outside
                    of a dropdown will close it.
                </p>
                <div className="components">
                    <Dropdown
                        options={options10}
                        selected={value}
                        onChange={setValue}
                    />
                    <Dropdown
                        multiselect
                        options={options10}
                        selected={values}
                        onChange={setValues}
                        closeOnClick={false}
                    />
                </div>
            </div>
            <div className="demo-section">
                <p>
                    All components can have their placeholders changed via prop,
                    along with their styles, whether they're disabled, and
                    whether they close once an option has been selected. Try
                    changing the input with the text that says 'Placeholder',
                    and clicking the button to disable the component.
                </p>
                <div className="components">
                    <input
                        type="text"
                        onChange={handlePlaceholderChange}
                        value={placeholder}
                    />
                    <Dropdown
                        options={options10}
                        selected={value_1}
                        onChange={setValue_1}
                        placeholder={placeholder}
                    />
                </div>
                <div className="components">
                    <Dropdown
                        style={{
                            width: "150px",
                            height: "60px",
                            margin: "10px",
                        }}
                        options={options10}
                        selected={value_2}
                        onChange={setValue_2}
                    />
                    <Dropdown
                        disabled={disabled}
                        options={options10}
                        selected={values_1}
                        onChange={setValues_1}
                    />
                    <button onClick={toggleDisabled}>
                        {disabled ? "Enable" : "Disable"}
                    </button>
                </div>
            </div>
            <div className="demo-section">
                <p>
                    The dropdowns also do error-checking; if the data they're
                    given is faulty (i.e. duplicate ids, selected values that
                    don't exist, etc) they will display an error state.
                </p>
                <div className="components">
                    <Dropdown
                        options={options_faulty}
                        selected={value_1}
                        onChange={setValue_1}
                    />
                </div>
            </div>
            <div className="demo-section">
                <p>
                    The dropdowns are also reasonably performant; the
                    multiselect below contains 100,000 options, and I have
                    tested both single and multiselect with up to 1,000,000
                    options. At 1,000,000 options, it lags a little when
                    clicking 'select all', but it does successfully run within a
                    few seconds. I considered this good enough, as if you have
                    over 1,000,000 options in a dropdown there is probably a
                    better way to manipulate the data.
                </p>
                <div className="components">
                    <p>Currently selected: {values_2.length} options</p>
                    <Dropdown
                        multiselect
                        options={options100000}
                        selected={values_2}
                        onChange={setValues_2}
                        closeOnClick={false}
                    />
                </div>
            </div>
            <div className="demo-section">
                <p>
                    As a final note, the dropdown also implements ref
                    forwarding. This wasn't hard to do, but I thought I'd
                    mention it for whatever bonus points it would net me :)
                    <br />
                    <br />
                    Thanks for looking this over! It was definitely one of the
                    more fun take-home problems I've been given; hope my code is
                    easy to read!
                </p>
            </div>
        </div>
    );
};

export default App;
