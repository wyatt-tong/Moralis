import sys
import pandas as pd
import json
import numpy as np
from dateutil.parser import parse
import os
# 0xad1d9d536d2ec0da134cd6eba570b62c734ea2ed
if __name__ == '__main__':
    pd.set_option('display.max_columns', None)
    if len(sys.argv) < 2:
        print("Not Enough Arguments")
    print(sys.argv[1])
    address = sys.argv[1]
    file_name = address + '.json'
    output_file = address + '.csv'

    '''Delete it if the output file already exits.'''
    # if os.path.exists(output_file):
    #     os.remove(output_file)

    '''Since the JSON file is nested, we need to normalize it.'''
    with open(file_name) as data_file:
        json_data = json.load(data_file)
    data = pd.json_normalize(json_data)
    # print(data)

    output = pd.DataFrame(columns=['datetime', 'clientId','txHash', 'debitAccount', 'debitAsset',
                                 'debitAmount', 'creditAccount', 'creditAsset', 'creditAmount', 'txFeeAccount',
                                 'txFeeAsset', 'txFeeAmount', 'payee', 'memo', 'txType', 'histFMV', 'basis'])

    for i in range(len(data)):
        d = dict()
        d['datetime'] = [data['block_timestamp.iso'].iloc[i]]
        d['datetime'][0] = d['datetime'][0][:-5] + d['datetime'][0][-1:]
        d['clientId'] = ''
        d['txHash'] = [data['hash'].iloc[i]]

        '''Withdrawal(Out)'''
        if data['from_address'].iloc[i] == address:
            d['debitAccount'] = 'Transfer'
            d['debitAsset'] = ['']
            d['debitAmount'] = np.nan
            d['creditAccount'] = [data['from_address'].iloc[i]]
            d['creditAsset'] = ['ETH']
            d['creditAmount'] = [data['decimal.value.$numberDecimal'].iloc[i]]
            d['txFeeAccount'] = ['']
            d['txFeeAmount'] = [np.nan]
            d['txFeeAsset'] = ['']
            d['txFeeAmount'] = [np.nan]
            d['payee'] = ['']
            d['memo'] = ['Withdrawal ' + str(d['creditAmount'][0]) + ' ETH']
            d['txType'] = 'Withdrawal'
            d['histFMV'] = np.nan
            d['basis'] = ['']

        '''Deposit (In)'''
        if data['to_address'].iloc[i] == address:
            d['debitAccount'] = [data['to_address'].iloc[i]]
            d['debitAsset'] = ['ETH']
            d['debitAmount'] = [data['decimal.value.$numberDecimal'].iloc[i]]
            d['creditAccount'] = 'Transfer'
            d['creditAsset'] = ['']
            d['creditAmount'] = [np.nan]
            d['txFeeAccount'] = ['']
            d['txFeeAmount'] = [np.nan]
            d['txFeeAsset'] = ['']
            d['txFeeAmount'] = [np.nan]
            d['payee'] = ['']
            d['memo'] = ['Deposit ' + str(d['debitAmount'][0]) + ' ETH']
            d['txType'] = 'Deposit'
            d['histFMV'] = np.nan
            d['basis'] = ['']
        output = pd.concat([output, pd.DataFrame(d)], ignore_index=True)

    print(output['debitAmount'])
    print(len(output))
    print(len(output.columns))
    print(output.columns)

    '''Sort the dataframe to make the output file easy to look up'''
    output['sort_helper'] = output['datetime'].apply(parse)
    output.sort_values(by='sort_helper', inplace=True, ascending=False)
    print(output['sort_helper'])
    output.drop(['sort_helper'], inplace=True, axis=1)
    output.to_csv(output_file, index=False)
