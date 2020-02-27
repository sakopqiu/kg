import FileBase from './FileBase';
import FsEntityJson from './FsEntity';

export default class SophonFile extends FileBase {
  constructor(apiData: FsEntityJson) {
    super(apiData);
    this.folder = false;
    // TODO delete operation will cause stackoverflow for the mobx@5.5.2
    // delete this.fileChildren;
  }
}
