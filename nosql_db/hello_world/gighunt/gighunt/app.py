from arango import ArangoClient


def main():
    # Подключаемся к ArangoDB
    client = ArangoClient(hosts='http://arangodb:8529')

    # Логинимся
    sys_db = client.db('_system', username='root', password='password')

    # Проверяем, существует ли база данных
    if not sys_db.has_database('test_db'):
        sys_db.create_database('test_db')

    # Подключаемся к базе данных
    db = client.db('test_db', username='root', password='password')

    # Проверяем, существует ли коллекция
    if not db.has_collection('test_collection'):
        collection = db.create_collection('test_collection')
    else:
        collection = db.collection('test_collection')

    # Вставляем данные
    doc = {'name': 'Alice', 'age': 25}
    collection.insert(doc)
    print('Document inserted:', doc)

    # Читаем данные
    cursor = collection.all()
    for document in cursor:
        print('Document found:', document)


if __name__ == "__main__":
    main()
