import RNFS from 'react-native-fs';
import { zip, unzip } from 'react-native-zip-archive';
import { config } from 'src/configs';

class FileUtil {
  static CacheDirectory = RNFS.CachesDirectoryPath;
  static DocumentDirectory = RNFS.DocumentDirectoryPath;
  static SharedGroupDirectory = '';

  static async mkdir(folderPath) {
    return RNFS.mkdir(folderPath, {
      NSURLIsExcludedFromBackupKey: true,
    });
  }

  static async create(filePath, data, encode) {
    return RNFS.writeFile(filePath, data || '', encode || 'utf8');
  }

  static async remove(path) {
    return RNFS.unlink(path);
  }

  static async removeSafe(path) {
    try {
      await RNFS.unlink(path);
    } catch (err) {
      console.log("File isn't existing");
    }
  }

  static async copyFile(sourcePath, destinationPath) {
    return RNFS.copyFile(sourcePath, destinationPath);
  }

  static async copyFileSafe(sourcePath, destinationPath) {
    try {
      await FileUtil.removeSafe(destinationPath);
      return await RNFS.copyFile(sourcePath, destinationPath);
    } catch (err) {
      console.log("File isn't existing");
    }
  }

  static async copyDir(sourceFolderPath, destinationFolderPath, ignoreDuplication) {
    await FileUtil.mkdir(destinationFolderPath);

    let items = await FileUtil.readDirItem(sourceFolderPath);

    for (let i = 0; i < items.length; i++) {
      let item = items[i];
      if (item.isFile()) {
        if (ignoreDuplication) {
          let existingFile = await FileUtil.exists(`${destinationFolderPath}/${item.name}`);
          if (!existingFile) {
            await FileUtil.copyFile(item.path, `${destinationFolderPath}/${item.name}`)
          }
        } else {
          await FileUtil.copyFile(item.path, `${destinationFolderPath}/${item.name}`)
        }
      }

      if (item.isDirectory()) {
        let destDir = `${destinationFolderPath}/${item.name}`;
        await FileUtil.mkdir(destDir);
        await FileUtil.copyDir(item.path, destDir, ignoreDuplication);
      }
    }
  }

  static async moveFile(sourcePath, destinationPath) {
    return RNFS.moveFile(sourcePath, destinationPath);
  }

  static async moveFileSafe(sourcePath, destinationPath) {
    try {
      await RNFS.unlink(destinationPath);
    } catch (err) {
      console.log("Destination path isn't existing");
    }
    return RNFS.moveFile(sourcePath, destinationPath);
  }

  static async downloadFile(options) {
    return await RNFS.downloadFile(options).promise;
  }

  static async uploadFiles(options) {
    return await RNFS.uploadFiles(options).promise;
  }

  static async readDir(folderPath) {
    return await RNFS.readdir(folderPath);
  }

  static async readDirItem(folderPath) {
    return await RNFS.readDir(folderPath);
  }

  static async readFile(filePath, encoding) {
    return await RNFS.readFile(filePath, encoding);
  }

  static async stat(filePath) {
    return await RNFS.stat(filePath);
  }

  static async writeFile(filePath, content, encoding = 'utf8') {
    return await RNFS.writeFile(filePath, content, encoding);
  }

  static async zip(inputPath, outputPath) {
    return zip(inputPath, outputPath);
  }

  static async unzip(inputPath, outputPath) {
    return unzip(inputPath, outputPath);
  }

  static async exists(filePath) {
    return RNFS.exists(filePath);
  }

  static async pathForGroup(groupIdentifier) {
    return await RNFS.pathForGroup(groupIdentifier);
  }

  static getSharedLocalStorageFolderPath(bitmarkAccountNumber, isAndroid) {
    if (isAndroid) {
      return `${FileUtil.DocumentDirectory}/${bitmarkAccountNumber}`;
    } else {
      return `${FileUtil.SharedGroupDirectory}/${bitmarkAccountNumber}`;
    }

  }

  static getLocalAssetsFolderPath(bitmarkAccountNumber, isAndroid) {
    return `${FileUtil.getSharedLocalStorageFolderPath(bitmarkAccountNumber, isAndroid)}/assets`;
  }
}
export { FileUtil };