<script setup lang="ts">
import Konva from 'konva';
import { KonvaEventObject } from 'konva/lib/Node';
import { onMounted, ref } from 'vue';
import { OpenposeBody, OpenposePerson } from './openpose';

const default_body_keypoints: [number, number, number][] = [
    [241, 77],
    [241, 120],
    [191, 118],
    [177, 183],
    [163, 252],
    [298, 118],
    [317, 182],
    [332, 245],
    [225, 241],
    [213, 359],
    [215, 454],
    [270, 240],
    [282, 360],
    [286, 456],
    [232, 59],
    [253, 60],
    [225, 70],
    [260, 72]
].map((loc) => [loc[0], loc[1], 1.0])

const canvasRef = ref<HTMLDivElement | null>(null);
const stageRef = ref<Konva.Stage | null>(null);
const lowerRef = ref<Konva.Layer | null>(null);
const upperRef = ref<Konva.Layer | null>(null);

function initEditor() {
    // 获取dom元素
    const el = canvasRef.value!;
    if (!el) return;

    // 画布
    stageRef.value = new Konva.Stage({
        container: el, // 渲染到某个ID上
        width: 1105, // 画布宽
        height: 793, // 画布高
    });

    stageRef.value.on('wheel', (e: KonvaEventObject<WheelEvent>) => {
        const scaleBy = 1.1;
        const oldScale = stageRef.value!.scaleX();
        const pointerPos = stageRef.value!.getPointerPosition();
        const mousePointTo = {
            x: (pointerPos!.x - stageRef.value!.x()) / oldScale,
            y: (pointerPos!.y - stageRef.value!.y()) / oldScale,
        }

        let newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
        if (newScale > 20) newScale = 20;
        if (newScale < 0.01) newScale = 0.01;
        stageRef.value!.scale({x: newScale, y: newScale});

        const newPos = {
            x: pointerPos!.x - mousePointTo.x * newScale,
            y: pointerPos!.y - mousePointTo.y * newScale,
        };

        stageRef.value!.position(newPos);
        stageRef.value!.batchDraw();

        e.evt.preventDefault();
        e.evt.stopPropagation();
    });

    //图层
    lowerRef.value = new Konva.Layer();
    upperRef.value = new Konva.Layer();

    lowerRef.value.canvas._canvas.style.backgroundColor = '#222';

    // 添加到舞台中
    stageRef.value.add(lowerRef.value as Konva.Layer);
    stageRef.value.add(upperRef.value as Konva.Layer);

    // openpose canvas
    const openposeCanvas = new Konva.Rect({
        fill: '#000',
        x: stageRef.value.width() / 2 - 256,
        y: stageRef.value.height() / 2 - 256,
        width: 512,
        height: 512,
    });
    lowerRef.value.add(openposeCanvas);

    // add openpose canvas should be at last layer
    openposeCanvas.moveToBottom();

    addDefaultPerson();
}

function addPerson(newPerson: OpenposePerson): void {
    newPerson;
}

function addDefaultPerson(): void {
    const newPerson = new OpenposePerson(null, new OpenposeBody(default_body_keypoints));
    addPerson(newPerson)
}

onMounted(() => {
    initEditor();
});
</script>

<template>
    <div class="editor">
        <div class="canvas" id="canvas" ref="canvasRef"></div>
    </div>
</template>

<style scoped lang="scss">
.editor {
    display: flex;
    justify-content: center;
}
</style>
