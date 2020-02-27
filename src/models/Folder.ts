import FileBase from './FileBase';
import FsEntityJson from './FsEntity';
import SophonFile from './SophonFile';

export default class Folder extends FileBase {
    constructor(json: FsEntityJson) {
        super(json);
        this.folder = true;
        if (json.children) {
            for (const child of json.children) {
                if (!child.folder) {
                    this.fileChildren.push(new SophonFile(child));
                } else {
                    this.fileChildren.push(new Folder(child));
                }
            }
        }
    }
}
