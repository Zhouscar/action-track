import { Janitor } from "@rbxts/janitor";

export type KeyPointFunction = () => "cancel" | "continue";
export type ValidateFunction = () => "cancel" | "continue";

export class ActionTrack {
    _started: boolean = false;
    _stopped: boolean = false;
    _startTime: number = 0;
    _janitor: Janitor = new Janitor();

    _processedTime: number = 0;

    _keyPoints: [number, boolean, KeyPointFunction][] = [];
    _validate: KeyPointFunction = () => "continue";

    constructor(validate: ValidateFunction) {
        this._validate = validate;
    }

    addKeyPoint(atTime: number, keyPointFunction: KeyPointFunction) {
        this._keyPoints.push([atTime, false, keyPointFunction]);
    }

    addCleanup(fn: () => void) {
        this._janitor.Add(fn);
    }

    scale(scaleTo: number) {
        if (this._stopped) return;

        this._keyPoints.forEach((v) => {
            v[0] = v[0] * scaleTo;
        });
    }

    stop() {
        this._stopped = true;
        this._janitor.Destroy();
    }

    stopped() {
        return this._stopped;
    }

    start() {
        if (this._stopped) {
            warn("It's already stopped before you started you dumb dumb >:(");
            return;
        }
        this._started = true;
        this._startTime = tick();
    }

    step() {
        if (this._stopped) return;
        if (!this._started) return;
        if (this._validate() === "cancel") {
            this.stop();
            return;
        }

        this._processedTime = tick() - this._startTime;

        const keyPointFunctionsToRun = this._keyPoints
            .filter((v) => this._processedTime >= v[0] && !v[1])
            .sort((a, b) => a[0] < b[0]);

        if (keyPointFunctionsToRun.isEmpty()) {
            this.stop();
            return;
        }

        keyPointFunctionsToRun.forEach((v) => {
            if (this._stopped) return;
            const result = v[2]();
            if (result === "cancel") {
                this.stop();
                return;
            }
            v[1] = true;
        });
    }
}
