import { BaseData } from "../../store/AppState";
import { AddImportData } from "../../store/Store";

export type VersionProperties = {
  type: "VersionProperties";

  /** file to be imported or empty string */
  fileName: string;
  
  basedata: BaseData;

  addImportData: AddImportData;

}