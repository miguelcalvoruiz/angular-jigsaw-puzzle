import { ProgressBar } from "./progressBar";
import { Stopwatch } from "./stopWatch";

export interface GameProgress {
    progressBar: ProgressBar;
    time: Stopwatch | null;
}