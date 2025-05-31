import React from "react";
import { useParams } from "react-router-dom";
import LeetCode from "./LeetCode";
import Codeforces from "./Codeforces"
// In future, you can import more like:
// import MoreInfoCodeforces from "./MoreInfoCodeforces";

export default function MoreInfoPage() {
  const { platform } = useParams();

  const componentMap = {
    leetcode: <LeetCode />,
    codeforces: <Codeforces />,
    // codeforces: <MoreInfoCodeforces />,
    // add more when ready
  };

  return componentMap[platform?.toLowerCase()] || (
    <div className="text-red-500 text-center mt-10">
      Platform "{platform}" not supported yet.
    </div>
  );
}
