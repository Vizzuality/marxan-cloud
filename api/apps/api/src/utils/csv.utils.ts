import { User } from '@marxan-api/modules/users/user.api.entity';
import { CsvFormatterStream, format, FormatterRow } from 'fast-csv';
import { Repository } from 'typeorm';

const columnsAndCsvHeaders = [
  'fname',
  'lname',
  'email',
  'country',
  'background',
  'level',
];

export const buildUsersInfoCsv = async (
  userRepo: Repository<User>,
): Promise<CsvFormatterStream<FormatterRow, FormatterRow>> => {
  const allUsersStream = await userRepo
    .createQueryBuilder('users')
    .select(columnsAndCsvHeaders)
    .stream();

  const csvHeaders = [
    'fname',
    'lname',
    'email',
    'country',
    'background',
    'level',
  ];

  const csvHeaderStream = format({
    headers: csvHeaders,
    writeHeaders: true,
    includeEndRowDelimiter: true,
  });

  allUsersStream
    .on('data', (row) => {
      csvHeaderStream.write(row);
    })
    .on('end', () => csvHeaderStream.end());

  return csvHeaderStream;
};
