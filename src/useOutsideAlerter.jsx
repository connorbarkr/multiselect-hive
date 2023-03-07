import { useEffect } from 'react'

// from https://stackoverflow.com/questions/32553158/detect-click-outside-react-component
const useOutsideAlerter = (ref, clickEvent) => {
  useEffect(() => {
      function handleClickOutside(event) {
          if (ref.current && !ref.current.contains(event.target)) {
            clickEvent();
          }
      }

      document.addEventListener("mousedown", handleClickOutside);
      return () => {
          document.removeEventListener("mousedown", handleClickOutside);
      };
  }, [ref, clickEvent]);
}

export default useOutsideAlerter;