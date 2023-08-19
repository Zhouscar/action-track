import { ActionTrack } from "./actionTrack";

export class ActionTrackContainer {
    _tracks: ActionTrack[] = [];

    constructor() {}

    play(track: ActionTrack) {
        if (!this._tracks.includes(track)) {
            this._tracks.push(track);
            track.start();
        }
    }

    _reconcile() {
        this._tracks.forEach((v, i) => {
            if (v.stopped()) {
                this._tracks.remove(i);
            }
        });
    }

    step() {
        this._tracks.forEach((v) => {
            v.step();
        });
        this._reconcile();
    }
}
