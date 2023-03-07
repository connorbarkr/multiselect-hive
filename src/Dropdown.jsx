import {
    forwardRef,
    useState,
    useCallback,
    useMemo,
    useEffect,
    useRef,
} from "react";
import PropTypes from "prop-types";

import { ReactComponent as Expand } from "./chevron-down.svg";
import { ReactComponent as Clear } from "./x.svg";
import { ReactComponent as Unchecked } from "./square.svg";
import { ReactComponent as Checked } from "./check-square-fill.svg";

import "./styles/Dropdown.scss";
import useOutsideAlerter from "./useOutsideAlerter";

const defaultStyle = {
    height: "40px",
    width: "300px",
    margin: "0px 10px",
};

const Dropdown = forwardRef((props, ref) => {
    // The dropdown's ref; either forwarded or created here
    const dropdownRef = useRef(ref || null);
    // Boolean tracking whether the menu is open
    const [open, setOpen] = useState(false);
    // Boolean tracking whether the dropdown is in an error state
    const [error, setError] = useState(false);
    // The current render length of the dropdown menu (i.e. this many options will be rendered)
    const [length, setLength] = useState(
        Math.min(props.batchSize, props.options.length)
    );
    // Boolean tracking whether or not all of the options are selected
    const [allSelected, setAllSelected] = useState(false);

    // These two state variables are explained later in the code
    const [parsedOptions, setParsedOptions] = useState([]);
    const [sanitizedSelected, setSanitizedSelected] = useState([]);

    // closes the dropdown; mainly used by the useOutsideAlerter hook
    // also responsible for resetting the current render length
    const close = useCallback(() => {
        setLength(Math.min(props.batchSize, props.options.length));
        setOpen(false);
    }, [props.batchSize, props.options.length]);

    // Helper function that checks whether an option is currently selected
    const isSelected = useCallback(
        (option) => {
            let filteredList = sanitizedSelected.filter(
                (e) => e.id === option.id
            );
            return filteredList.length > 0;
        },
        [sanitizedSelected]
    );

    // Closes menu when selecting an option
    const autoClose = useCallback(() => {
        if (props.closeOnClick) close();
    }, [close, props.closeOnClick]);

    // Used by the toggle chevron
    const toggleOpen = useCallback(() => {
        if (open) {
            // calls close so the render length can be reset
            close();
        } else {
            setOpen(true);
        }
    }, [open, close]);

    // deselects all options in a multiselect
    const deselectAll = useCallback(() => {
        if (props.multiselect) {
            props.onChange([]);
        } else {
            props.onChange(null);
        }
        autoClose();
    }, [props, autoClose]);

    // selects all options in a multiselect,
    // or deselects all if they're all selected
    const selectAll = useCallback(() => {
        if (props.multiselect) {
            if (allSelected) {
                props.onChange([]);
            } else {
                props.onChange(props.options);
            }
        }
        autoClose();
    }, [props, autoClose, allSelected]);

    // Formats the options to include whether they're selected or not;
    // this is done to reduce the number of times the 'selected' array needs
    // to be searched to see if an option has been selected
    useEffect(() => {
        // check whether all options are selected for the 'Select All' button
        let all = true;
        let newOptions = [];
        // only renders options up to the current length
        for (let i = 0; i < length; i++) {
            const option = props.options[i];
            const selected = isSelected(option);
            if (!selected) all = false;
            // Store whether the option is currently selected
            newOptions.push({ data: option, selected });
        }
        setAllSelected(all);
        setParsedOptions(newOptions);
    }, [props.options, isSelected, length]);

    // Sanitize the array of selected options
    // null, [null], and [] should all produce []
    // <Item>, [<Item>], and [<Item>, null] should all produce [<Item>]
    useEffect(() => {
        const dirty = [];
        // convert the selected prop into an array if it isn't one
        if (props.selected !== null) dirty.push(props.selected);
        let sanitized = [...dirty.flat()];
        // remove all null values
        sanitized = sanitized.filter((option) => option !== null);
        setSanitizedSelected(sanitized);
    }, [props.selected]);

    // Error checking on options and selected
    useEffect(() => {
        let foundError = false;
        const optionIds = {};
        const selectedIds = {};
        // don't allow duplicate option ids
        props.options.forEach((option) => {
            if (optionIds[option.id]) foundError = true;
            optionIds[option.id] = option;
        });
        // single value dropdowns can't have multiple selected values
        if (!props.multiselect && sanitizedSelected.length > 1)
            foundError = true;
        // don't allow duplicate selected option ids,
        // or selected options that don't exist in the options array
        sanitizedSelected.forEach((option) => {
            if (
                selectedIds[option.id] ||
                !optionIds[option.id] ||
                optionIds[option.id].label !== option.label ||
                optionIds[option.id].value !== option.value
            ) {
                foundError = true;
            }
            selectedIds[option.id] = true;
        });
        setError(foundError);
        if (foundError) {
            setParsedOptions([]);
        }
    }, [props.multiselect, props.options, sanitizedSelected]);

    // Used when selecting a specific option
    const handleSelect = useCallback(
        (option) => () => {
            let selected = option;
            if (props.multiselect) {
                selected = [...sanitizedSelected];
                if (isSelected(option)) {
                    // if the option is selected, remove it from the list
                    selected = selected.filter((e) => {
                        if (e !== null) {
                            return e.id !== option.id;
                        }
                        return false;
                    });
                } else {
                    // otherwise, add it to the list
                    selected.push(option);
                }
            }
            props.onChange(selected);
            autoClose();
        },
        [props, isSelected, autoClose, sanitizedSelected]
    );

    // Scroll handler used to render the next batch of options
    // when the menu has been scrolled to the bottom
    const handleScroll = useCallback(
        (e) => {
            const bottom =
                e.target.scrollHeight - e.target.scrollTop ===
                e.target.clientHeight;
            if (bottom && length < props.options.length) {
                // don't set the length greater than the number of props
                setLength(
                    Math.min(props.options.length, length + props.batchSize)
                );
            }
        },
        [length, props.batchSize, props.options.length]
    );

    // Render the currently selected options in the main dropdown
    const renderSelectedLabel = useMemo(() => {
        const optionSelected = sanitizedSelected.length > 0;
        let label = props.placeholder;
        // If there is at least one currently selected option, create a label representing it
        if (optionSelected && !error) {
            if (props.multiselect) {
                label = "";
                // Concatenate each selected option's label
                sanitizedSelected.forEach((option, i) => {
                    label = label.concat(option.label);
                    if (i < sanitizedSelected.length - 1)
                        label = label.concat(", ");
                });
            } else {
                label = sanitizedSelected[0].label;
            }
        }
        return (
            <div
                className={`dropdown-label ${
                    !optionSelected ? "placeholder" : ""
                }`}
            >
                {error ? <span>Error!</span> : label}
            </div>
        );
    }, [sanitizedSelected, props.placeholder, props.multiselect, error]);

    // Memoize the disabled and error styles based on the props, options length, and error state
    const disabledOrError = useMemo(() => {
        if (error) return "error";
        if (props.disabled) return "disabled";
        return "";
    }, [props.disabled, error]);

    // Render the dropdown menu
    const renderMenu = useMemo(
        () => (
            <div
                // dynamically translate the menu based on the dropdown height
                style={{
                    transform: `translateY(calc(${props.style.height} + 5px))`,
                }}
                onScroll={handleScroll}
                className={`dropdown-options ${open ? "open" : "closed"}`}
            >
                {/* If no options have been passed in, render an option that says so */}
                {parsedOptions.length === 0 ? (
                    <span className="option-empty">
                        <span className="label">{"No options"}</span>
                    </span>
                ) : null}

                {/* If this is a multiselect component, add an option to select all */}
                {props.multiselect && parsedOptions.length > 0 ? (
                    <span
                        className={`option ${allSelected ? "selected" : ""}`}
                        onClick={selectAll}
                    >
                        <span className="checkbox">
                            <input
                                type="checkbox"
                                checked={allSelected}
                                onChange={selectAll}
                            />
                            {allSelected ? (
                                <Checked className="checked" />
                            ) : (
                                <Unchecked className="unchecked" />
                            )}
                        </span>
                        <span className="label">{"Select all"}</span>
                    </span>
                ) : null}

                {/* map the parsedOptions array to individual option elements */}
                {parsedOptions.map((option) => {
                    return (
                        <span
                            className={`option ${
                                option.selected ? "selected" : ""
                            }`}
                            onClick={handleSelect(option.data)}
                            key={option.data.id}
                        >
                            {props.multiselect ? (
                                <span className="checkbox">
                                    <input
                                        type="checkbox"
                                        checked={option.selected}
                                        onChange={handleSelect(option.data)}
                                    />
                                    {option.selected ? (
                                        <Checked className="checked" />
                                    ) : (
                                        <Unchecked className="unchecked" />
                                    )}
                                </span>
                            ) : null}
                            <span className="label">{option.data.label}</span>
                        </span>
                    );
                })}
            </div>
        ),
        [
            allSelected,
            handleScroll,
            handleSelect,
            open,
            parsedOptions,
            props.multiselect,
            props.style.height,
            selectAll,
        ]
    );

    // trigger close when clicking outside the dropdown
    useOutsideAlerter(dropdownRef, close);

    return (
        <div className="dropdown" ref={dropdownRef} style={props.style}>
            {/* The dropdown-selection class contains the currently selected value(s) and the chevron indicator. */}
            <div className={`dropdown-selection ${disabledOrError}`}>
                {/* The memoized renderSelectedLabel function returns the label showing what is currently selected,
				or the placeholder. */}
                {renderSelectedLabel}
                <span className="icons">
                    <Clear
                        className={`clear ${
                            sanitizedSelected.length > 0 ? "active" : "inactive"
                        }`}
                        onClick={deselectAll}
                    />
                    <Expand
                        className={`expand ${open ? "flipped" : ""}`}
                        onClick={toggleOpen}
                    />
                </span>
            </div>
            {/* The memoized renderMenu component contains the list of options, pulled from the props. */}
            {renderMenu}
        </div>
    );
});

Dropdown.propTypes = {
    options: PropTypes.array.isRequired,
    onChange: PropTypes.func.isRequired,
    style: PropTypes.object,
    selected: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
    multiselect: PropTypes.bool,
    placeholder: PropTypes.string,
    closeOnClick: PropTypes.bool,
    disabled: PropTypes.bool,
    batchSize: PropTypes.number,
};

Dropdown.defaultProps = {
    style: defaultStyle,
    disabled: false,
    multiselect: false,
    closeOnClick: true,
    placeholder: "Select a value",
    batchSize: 50,
};

export default Dropdown;
