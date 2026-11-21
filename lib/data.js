// dependencies
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// recreate __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// module scaffolding
const lib = {};

// base directory of the data folder
lib.baseDir = path.join(__dirname, '/../.data/');

// .data is git-ignored, so create the collections on first start
['users', 'tokens', 'checks'].forEach((dir)=>{
    fs.mkdirSync(path.join(lib.baseDir, dir), { recursive: true });
});

// write data to a file
lib.create = function(dir, file, data, callback){
    //open the file for writting
    fs.open(lib.baseDir+dir+'/'+file+'.json', 'wx', function(err1, fileDescriptor){
        if(!err1 && fileDescriptor){
            // convert to string
            const stringData = JSON.stringify(data);
            // write to file and close
            fs.write(fileDescriptor, stringData, function(err2){
               if(!err2){
                   fs.close(fileDescriptor, function(err3){
                       if(!err3){
                           callback(false);
                       }else{
                           callback(err3);
                       }
                   });
               }else{
                   callback(err2);
               } 
            });
        }else{
            callback(err1);
        }
    });
};

// read data from a file
lib.read = function(dir, file, callback){
    fs.readFile(lib.baseDir+dir+'/'+file+'.json', 'utf8', function(err, data){
        if(!err && data){
            const parsedData = JSON.parse(data);
            callback(false, parsedData);
        }else{
            callback(err, data);
        }
    });
};

// update data in a file
lib.update = function(dir, file, data, callback){
    // open the file for writting
    fs.open(lib.baseDir+dir+'/'+file+'.json', 'r+', function(err1, fileDescriptor){
        if(!err1 && fileDescriptor){
            // convert to string
            const stringData = JSON.stringify(data);
            // truncate data
            fs.ftruncate(fileDescriptor, function(err2){
                if(!err2){
                    // write to the file, and close it
                    fs.write(fileDescriptor, stringData, function(err3){
                        if(!err3){
                            fs.close(fileDescriptor, function(err4){
                                if(!err4){
                                    callback(false);
                                }else{
                                    callback(err4);
                                }
                            });
                        }else{
                            callback(err3);
                        }
                    })
                }else{
                    callback(err2);
                }
            });
        } else {
            callback(err1);
        }
    });
};

// delete a file
lib.delete = function(dir, file, callback){
    // unlink the file
    fs.unlink(lib.baseDir+dir+'/'+file+'.json', function(err){
        if(!err){
            callback(false);
        }else{
            callback(err);
        }
    });
};

// get all file names in a directory
lib.list = function(dir, callback){
    fs.readdir(lib.baseDir+dir+'/', function(err, data){
        if(!err && data && data.length > 0){
            const trimmedFileNames = [];
            data.forEach(function(fileName){
                trimmedFileNames.push(fileName.replace('.json', ''));
            });
            callback(false, trimmedFileNames);
        }else{
            callback(err, data);
        }
    });
};

export default lib;