<script setup lang="ts">
import Konva from 'konva';
import { onMounted, ref } from 'vue';

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
        container: el, //渲染到某个ID上
        width: 1105, //画布宽
        height: 793, //画布高
    });

    stageRef.value.on('wheel', (e) => {
        const scaleBy = 1.1;
        const oldScale = stageRef.value!.scaleX();
        const pointerPosition = stageRef.value!.getPointerPosition();
        const mousePointTo = {
            x: (pointerPosition!.x - stageRef.value!.x()) / oldScale,
            y: (pointerPosition!.y - stageRef.value!.y()) / oldScale,
        }

        const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
        stageRef.value!.scale({x: newScale, y: newScale});

        const newPos = {
            x: pointerPosition!.x - mousePointTo.x * newScale,
            y: pointerPosition!.y - mousePointTo.y * newScale,
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

    // 添加到画布中
    stageRef.value.add(lowerRef.value as Konva.Layer);
    stageRef.value.add(upperRef.value as Konva.Layer);

    // openpose canvas
    var openposeCanvas = new Konva.Rect({
        fill: '#000',
        x: stageRef.value.width() / 2 - 256,
        y: stageRef.value.height() / 2 - 256,
        width: 512,
        height: 512,
      });
      // add the shape to the layer
    upperRef.value.add(openposeCanvas);
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
