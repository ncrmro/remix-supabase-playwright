import React from "react";
import { GlobalContext } from "~/utils/globalContext";

export default function useViewer() {
  return React.useContext(GlobalContext).viewer;
}
