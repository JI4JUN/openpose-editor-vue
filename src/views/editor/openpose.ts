import Konva from 'konva';
import _ from 'lodash';

class OpenposeKeypoint2D extends Konva.Circle {
    static idCounter: number = 0;

    kp_id: number;
    confidence: number;
    kpName: string;
    connections: Array<OpenposeConnection>;
    selected: boolean;
    selected_in_group: boolean;
    constant_radius: number;

    constructor(
        x: number, y: number, confidence: number, color: string, name: string,
        opacity: number = 1.0, constant_radius: number = 2
    ) {
        super({
            radius: constant_radius,
            x: x,
            y: y,
            fill: color,
            stroke: color,
            strokeWidth: 1,
            opacity: opacity,
        });

        this.confidence = confidence;
        this.kpName = name;
        this.connections = [];
        this.kp_id = OpenposeKeypoint2D.idCounter++;
        this.selected = false;
        this.selected_in_group = false;
        this.constant_radius = constant_radius;
    }

    get kp_x(): number {
        return this.x();
    }

    set kp_x(x: number) {
        this.x(x);
    }

    get kp_y(): number {
        return this.y();
    }

    set kp_y(y: number) {
        this.y(y);
    }

    get _visible(): boolean {
        return this.visible === undefined ? true : this.visible();
    }

    set _visible(visible: boolean) {
        this.visible(visible);
        this.connections.forEach(c => {
            c.updateVisibility();
        });
    }

    get abs_point(): { x: number, y: number } {
        const parent = this.getParent();
        if (parent instanceof Konva.Group) {
            const absPoint = parent.getAbsolutePosition();

            return { x: absPoint.x, y: absPoint.y };
        } else {
            return { x: this.kp_x, y: this.kp_y };
        }
    }

    get abs_x(): number {
        return this.abs_point.x;
    }

    get abs_y(): number {
        return this.abs_point.y;
    }

    addConnection(connection: OpenposeConnection): void {
        this.connections.push(connection);
    }
}

class OpenposeConnection extends Konva.Line {
    k1: OpenposeKeypoint2D;
    k2: OpenposeKeypoint2D;

    constructor(
        k1: OpenposeKeypoint2D, k2: OpenposeKeypoint2D, color: string,
        opacity: number = 1.0, strokeWidth: number = 2
    ) {
        super({
            points:[k1.kp_x, k1.kp_y, k2.kp_x, k2.kp_y],
            fill: color,
            stroke: color,
            strokeWidth,
            draggable: false,
            opacity: opacity,
        });
        this.k1 = k1;
        this.k2 = k2;
        this.k1.addConnection(this);
        this.k2.addConnection(this);
    }

    updateVisibility() {
        this.visible(this.k1._visible && this.k2._visible);
    }
}

class OpenposeObject {
    keypoints: OpenposeKeypoint2D[];
    connections: OpenposeConnection[];
    visible: boolean;
    group: Konva.Group | undefined;
    _locked: boolean;
    canvas: HTMLCanvasElement | undefined;
    openposeCanvas: Konva.Rect | undefined;

    // If the object is symmetrical, it should be flippable.
    flippable: boolean = false;

    constructor(keypoints: OpenposeKeypoint2D[], connections: OpenposeConnection[]) {
        this.keypoints = keypoints;
        this.connections = connections;
        this.visible = true;
        this.group = undefined;
        this._locked = false;
        this.canvas = undefined;
        this.openposeCanvas = undefined;

        // Negative x, y means invalid keypoint.
        this.keypoints.forEach(keypoint => {
            keypoint._visible = this.isKeypointValid(keypoint) && keypoint.confidence === 1.0;
        });
    }

    isKeypointValid(keypoint: OpenposeKeypoint2D): boolean {
        let offsetX = 0;
        let offsetY = 0;
        if (this.openposeCanvas !== undefined) {
            offsetX = this.openposeCanvas?.x()!;
            offsetY = this.openposeCanvas?.y()!;
        };

        return keypoint.abs_x - offsetX > 0 && keypoint.abs_y - offsetY > 0;
    }
}

function formatColor(color: [number, number, number]): string {
    return `rgb(${color.join(", ")})`;
}

class OpenposeBody extends OpenposeObject {
    static keypoints_connections: [number, number][] = [
        [0, 1], [1, 2], [2, 3], [3, 4],
        [1, 5], [5, 6], [6, 7], [1, 8],
        [8, 9], [9, 10], [1, 11], [11, 12],
        [12, 13], [0, 14], [14, 16], [0, 15],
        [15, 17],
    ];

    static colors: [number, number, number][] = [
        [255, 0, 0], [255, 85, 0], [255, 170, 0], [255, 255, 0],
        [170, 255, 0], [85, 255, 0], [0, 255, 0], [0, 255, 85],
        [0, 255, 170], [0, 255, 255], [0, 170, 255], [0, 85, 255],
        [0, 0, 255], [85, 0, 255], [170, 0, 255], [255, 0, 255],
        [255, 0, 170], [255, 0, 85]
    ];

    static keypoint_names = [
        "nose",
        "neck",
        "right_shoulder",
        "right_elbow",
        "right_wrist",
        "left_shoulder",
        "left_elbow",
        "left_wrist",
        "right_hip",
        "right_knee",
        "right_ankle",
        "left_hip",
        "left_knee",
        "left_ankle",
        "right_eye",
        "left_eye",
        "right_ear",
        "left_ear",
    ];

    /**
     * @param {Array<Array<float>>} rawKeypoints keypoints directly read from the openpose JSON format
     * [
     *   [x1, y1, c1],
     *   [x2, y2, c2],
     *   ...
     * ]
     */
    constructor(rawKeypoints: [number, number, number][]) {
        const keypoints = _.zipWith(rawKeypoints, OpenposeBody.colors, OpenposeBody.keypoint_names,
            (p, color, keypoint_name) => new OpenposeKeypoint2D(
                p[0],
                p[1],
                p[2],
                formatColor(color),
                keypoint_name,
                /* opacity= */ 0.7,
                /* constant_radius= */ 4
            ));

        const connections = _.zipWith(OpenposeBody.keypoints_connections, OpenposeBody.colors.slice(0, 17),
            (connection, color) => {
                return new OpenposeConnection(
                    keypoints[connection[0]],
                    keypoints[connection[1]],
                    formatColor(color),
                    /* opacity= */ 0.7,
                    /* strokeWidth= */ 4
                );
            });

        super(keypoints, connections);
        this.flippable = true;
    }
}

class OpenposeHand extends OpenposeObject {

}

class OpenposeFace extends OpenposeObject {

}

class OpenposePerson {
    static id = 0;

    name: string;
    body: OpenposeBody;
    left_hand: OpenposeHand | undefined;
    right_hand: OpenposeHand | undefined;
    face: OpenposeFace | undefined;
    id: number;
    visible: boolean;

    constructor(name: string | null, body: OpenposeBody,
        left_hand: OpenposeHand | undefined = undefined,
        right_hand: OpenposeHand | undefined = undefined,
        face: OpenposeFace | undefined = undefined
    ) {
        this.body = body;
        this.left_hand = left_hand;
        this.right_hand = right_hand;
        this.face = face;
        this.id = OpenposePerson.id++;
        this.visible = true;
        this.name = name == null ? `Person ${this.id}` : name;
    }
}

export {
    OpenposeBody,
    OpenposeConnection,
    OpenposeKeypoint2D,
    OpenposeObject,
    OpenposePerson,
    OpenposeHand,
    OpenposeFace,
};
