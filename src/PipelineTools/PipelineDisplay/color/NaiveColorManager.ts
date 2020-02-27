import {ColorManager, CommunityDefaultColors} from './ColorManager';

// 比较简单的颜色管理器，可能会造成频繁的颜色重复
class NaiveColorManagerClass implements ColorManager {
    typeColorIndex: Map<string, number> = new Map<string, number>();

    public getColorForType(type: string) {
        const colorPalette = CommunityDefaultColors;
        let colorIndex = 0;
        if (this.typeColorIndex.has(type)) {
            colorIndex = this.typeColorIndex.get(type)! % colorPalette.length;
        } else {
            colorIndex = this.typeColorIndex.size % colorPalette.length;
            this.typeColorIndex.set(type, colorIndex);
        }
        return colorPalette[colorIndex];
    }

}

export const NaiveColorManager = new NaiveColorManagerClass();
