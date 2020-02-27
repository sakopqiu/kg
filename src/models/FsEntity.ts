export default interface FsEntityJson {
    folder: boolean;
    name: string;
    path: string;
    description: string;
    children: FsEntityJson[];
    createTimestamp: number;
    modifyTimestamp: number;
    thumbNail?: string;
}
