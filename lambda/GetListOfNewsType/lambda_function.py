import json
import feedparser as fp
from time import mktime
from datetime import datetime
from dateutil.parser import parse

import os
import boto3
from boto3.dynamodb.conditions import Key, Attr

def lambda_handler(event, context):
    categories = {
        '정치': 'politics',
        '경제': 'money',
        '건강': 'health',
        '문화': 'style',
        '세계': 'world',
        '기술': 'tech',
        '인기': 'top',
    }
    category = categories[event['category']]
    newslist = []
    
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table(os.environ['DB_TABLE_NAME'])
    response = table.query(
        KeyConditionExpression=Key('category').eq(category),
        ScanIndexForward=False,
        Limit=15
    )
    if len(response['Items']) > 0 and (datetime.now()-parse(response['Items'][0]['createdAt'])).total_seconds() < 6000:
        recent_item = response['Items'][0]
        newslist = response['Items']
        print("check point")
    else:
        LIMIT = 5
        with open('NewsPapers.json') as data_file:
            companies = json.load(data_file)
        for company, value in companies.items():
            company,_ = company.split('_')
            count = 1
            if category in value:
                d = fp.parse(value[category])
                for entry in d.entries:
                    if hasattr(entry, 'published') and entry.published_parsed:
                        if count > LIMIT:
                            break
                        date = entry.published_parsed
                        date = datetime.fromtimestamp(mktime(date)).isoformat()
                        
                        article = {
                            'title': entry.title,
                            'url': entry.link,
                            'date': date,
                            'company' : company
                        }
                        newslist.append(article)
        newslist.sort(key=lambda x:x['date'],reverse=True)
        newslist = newslist[:15]
        
        if len(response['Items']) == 0:
            for news in newslist:
                table.put_item(Item={
                    'createdAt': str(datetime.now()),
                    'category': category,
                    'title': news['title'],
                    'url': news['url'],
                    'date': news['date'],
                    'company' : news['company']
                })
        else:
            for news in newslist:
                if news['url'] == response['Items'][0]['url']:
                    break
                table.put_item(Item={
                    'createdAt': str(datetime.now()),
                    'category': category,
                    'title': news['title'],
                    'url': news['url'],
                    'date': news['date'],
                    'company' : news['company']
                })
                    
    if event['url'] is '' or event['url'] is None:
        return newslist[0]
    for i,news in enumerate (newslist):
        if news['url'] == event['url']:
            if i < 24:
                return newslist[i+1]
            else:
                return None
                
    return None