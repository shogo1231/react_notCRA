import { dbSetting } from './mysqlConfig'

export async function GetStaffData() {
  try {
    // DB接続
    const connection = await dbSetting();
    const [rows, fields] = await connection.execute('SELECT * FROM user');
    return rows;
  }
  catch (err: any) {
    throw new Error(err)
  }
};
