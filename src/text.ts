import { useEffect, useState } from "react";

const useMediaQuery = (query) => {
    const [matches, setMatches] = useState(false);
    useEffect(() => {
        const media = window.matchMedia(query);
        const listner = () => setMatches(media.matches);
        if (media.matches !== matches) {
            // setMatches(media.matches);
            window.addEventListener("resize", listner);
        }

        return () => window.removeEventListener("resize", listner);
    }, [matches, query]);
    return matches;
};

export default useMediaQuery;