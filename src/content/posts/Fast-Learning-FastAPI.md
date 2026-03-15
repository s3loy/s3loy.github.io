---
title: Fast Learning FastAPI
published: 2025-06-07
tags:
  - python
  - backend
---

`pip install fastapi uvicorn`

## 1.1. part 1 **简单创建**

```python
#hello_world.py
from fastapi import FastAPI
import uvicorn

app = FastAPI()

@app.get("/")
async def read_root():
    return {"Hello": "World"}

if __name__ == '__main__':
    uvicorn.run(app)
    
#*或者在终端中使用uvicorn main:app --reload
```

我们添加`@app.get`部分

```python
@app.get("/items/{item_id}")
async def read_item(item_id: int):
    return {"item_id": item_id}
```

此时访问`http://127.0.0.1:8000/items/5`    ，会发现返回了`{"item_id":5}`,

如果访问的是[127.0.0.1:8000/items/sast](http://127.0.0.1:8000/items/sast)   ，会发现返回的是`{"detail":[{"type":"int_parsing","loc":["path","item_id"],"msg":"Input should be a valid integer, unable to parse string as an integer","input":"sast"}]}`

我们在`item_id`处使用注解要求其为`int`类型，能看到它会自动检验。

再向代码中添加

```python
fake_items_db = [{"item_name": "Foo"}, {"item_name": "Bar"}, {"item_name": "Baz"}]
@app.get("/items/")
def read_fake_item(skip: int = 0, limit: int = 10):
    return fake_items_db[skip : skip + limit]
```

此时访问`http://127.0.0.1:8000/items/?skip=0&limit=2`，会发现返回是`[{"item_name":"Foo"},{"item_name":"Bar"}]`

## 1.2. part 2 **响应模型**

### 请求体和 Pydantic 模型

为了定义请求体的结构，FastAPI 使用了 Pydantic 库。

```python
from fastapi import FastAPI
from pydantic import BaseModel

class Item(BaseModel):
    name: str
    description: str | None = None
    price: float
    tax: float | None = None

app = FastAPI()

@app.post("/items/")
async def create_item(item: Item):
    return item
```

然后也可以顺手用`requests`库来验证一下

```python
import requests

url = "http://127.0.0.1:8000/items/"

my_item = {
  "name": "111test",
  "description": "null",
  "price": 1145.14,
  "tax": 666.25
}

response = requests.post(url, json=my_item)

print("状态码 (Status Code):", response.status_code)
print("响应内容 (Response JSON):")
print(response.json())
```

`状态码 (Status Code): 200
响应内容 (Response JSON):
{'name': '111test', 'description': 'null', 'price': 1145.14, 'tax': 666.25}`

我们可以修改响应结果，为了让部分数据不可见之类的

```python
class ItemIn(BaseModel):
    name: str
    description: str | None = None
    price: float
    tax: float | None = None
    
class ItemOut(BaseModel):
    name: str
    price: float

app = FastAPI()

@app.post("/items/", response_model=ItemOut)
async def create_item(item: ItemIn):
    return item
```

这样用相同的测试会发现是`{'name': '111test', 'price': 1145.14}`

## 1.3. part 3 **依赖注入**

`Depends` 会告诉 `FastAPI`，``read_items` 函数依赖于 `common_parameters` 函数的返回值。它的核心优势在于 **代码复用** 和 **逻辑分离**。

### 1.3.1. 共享通用参数

```python
from fastapi import Depends, FastAPI
from typing import Annotated

app = FastAPI()

# 这是一个“依赖项”函数
async def common_parameters(q: str | None = None, skip: int = 0, limit: int = 100):
    return {"q": q, "skip": skip, "limit": limit}

# Python 3.9+ 推荐使用 Annotated 来组织 Depends
# CommonsDep 的意思就是：我需要一个 dict，这个 dict 是通过调用 common_parameters 函数得到的
CommonsDep = Annotated[dict, Depends(common_parameters)]

fake_items_db = [{"item_name": "Foo"}, {"item_name": "Bar"}, {"item_name": "Baz"}]
fake_users_db = [{"user_name": "Alice"}, {"user_name": "Bob"}, {"user_name": "Charlie"}]


@app.get("/items/")
async def read_items(commons: CommonsDep):
    # commons 参数现在就是一个字典，比如 {"q": None, "skip": 0, "limit": 100}
    response = {}
    if commons["q"]:
        response.update({"query": commons["q"]})
    
    items = fake_items_db[commons["skip"] : commons["skip"] + commons["limit"]]
    response.update({"items": items})
    return response

@app.get("/users/")
async def read_users(commons: CommonsDep):
    # read_users 函数也轻松地复用了分页和查询逻辑
    response = {}
    if commons["q"]:
        response.update({"query": commons["q"]})
    
    users = fake_users_db[commons["skip"] : commons["skip"] + commons["limit"]]
    response.update({"users": users})
    return response
```

现在，`/items/`和 `/users/` 两个端点都拥有了同样的分页和查询能力，而我们只写了一次核心逻辑。这就是依赖注入最直观的好处。

### 1.3.2. 依赖项作为“守卫”

依赖注入一个更强大的用途是处理认证和授权

```python
from fastapi import Header, HTTPException

async def verify_token(x_token: Annotated[str, Header()]):
    """
    这个依赖项会检查请求头中是否包含 'X-Token'，并且值是否为 'fake-super-secret-token'
    Header() 告诉 FastAPI 这个参数要从请求头里获取。
    """
    if x_token != "fake-super-secret-token":
        raise HTTPException(status_code=400, detail="X-Token header invalid")
    return x_token


@app.get("/protected-route/", dependencies=[Depends(verify_token)])
async def read_protected_route():
    """
    这个端点被依赖项保护起来了。
    只有当请求头包含 X-Token: fake-super-secret-token 时，才能访问成功。
    否则，客户端会直接收到 400 错误。
    """
    return {"message": "Welcome, you have the correct token!"}
```

## 1.4. part 4 组织大型应用

当API越来越多，把所有东西都写在同一个 `main.py` 文件里会变得难以维护。`APIRouter` 允许你将API按功能模块拆分到不同的文件中。

文件树如下

```bash
/my_app
|-- /routers
|   |-- items.py
|   |-- users.py
|-- main.py
```

然后内容如下

`routers/items.py`

```python
# routers/items.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List

class Item(BaseModel):
    name: str

# 1. 创建一个 APIRouter 实例
router = APIRouter(
    prefix="/items",            # 为这个路由下的所有路径添加URL前缀
    tags=["Items"],             # 在API文档中为它们分组
    responses={404: {"description": "Item not found"}}, # 统一的错误响应
)

fake_items_db = [{"name": "Foo"}, {"name": "Bar"}, {"name": "Baz"}]

@router.get("/", response_model=List[Item])
async def read_items(skip: int = 0, limit: int = 10):
    return fake_items_db[skip : skip + limit]

@router.get("/{item_id}")
async def read_item(item_id: int):
    """
    根据ID获取单个物品。
    """
    # 在真实应用中，这里会是数据库查询
    if item_id >= len(fake_items_db) or item_id < 0:
        raise HTTPException(status_code=404, detail="Item not found")
    return fake_items_db[item_id]
```

`routers/users.py`

```python
# routers/users.py

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from typing import List, Optional

class UserBase(BaseModel):
    username: str
    email: EmailStr  # Pydantic内置的Email验证类型
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserPublic(UserBase):
    id: int
    is_active: bool

router = APIRouter(
    prefix="/users",
    tags=["Users"],
    responses={404: {"description": "User not found"}},
)

fake_users_db = {
    1: {
        "id": 1,
        "username": "john.doe",
        "email": "john.doe@example.com",
        "full_name": "John Doe",
        "hashed_password": "fake_hashed_password_123", # 模拟存储的是哈希后的密码
        "is_active": True,
    },
    2: {
        "id": 2,
        "username": "jane.smith",
        "email": "jane.smith@example.com",
        "full_name": "Jane Smith",
        "hashed_password": "another_fake_password_456",
        "is_active": False,
    }
}


@router.get("/", response_model=List[UserPublic])
async def read_users(skip: int = 0, limit: int = 10):
    """
    获取一个用户列表，同样支持分页。
    """
    users_list = list(fake_users_db.values())
    return users_list[skip : skip + limit]

@router.post("/", response_model=UserPublic, status_code=201)
async def create_user(user: UserCreate):
    """
    创建一个新用户。
    在真实世界中，你会在这里哈希密码，然后存入数据库。
    """
    new_user_id = max(fake_users_db.keys()) + 1
    
    db_user = {
        "id": new_user_id,
        "username": user.username,
        "email": user.email,
        "full_name": user.full_name,
        "hashed_password": f"hashed_{user.password}", # 假装哈希了密码
        "is_active": True, 
    }
    
    fake_users_db[new_user_id] = db_user
    
    return db_user


@router.get("/{user_id}", response_model=UserPublic)
async def read_user(user_id: int):
    """
    根据ID获取单个用户信息。
    """
    if user_id not in fake_users_db:
        raise HTTPException(status_code=404, detail="User not found")
    return fake_users_db[user_id]
```

`main.py`

```python
# main.py
from fastapi import FastAPI
from routers import items, users  # <-- 在这里导入 users

app = FastAPI(title="我的模块化大型应用")

app.include_router(items.router)
app.include_router(users.router)

@app.get("/")
async def root():
    return {"message": "Welcome to the main application"}

if __name__ =='__main__':
    import uvicorn
    uvicorn.run(app)
```

> **思考**：目前items和users的数据是完全隔离的，并且每次服务器重启都会丢失。在真实应用中，这些数据应该存放在一个共享的、持久化的数据库中。接下来，我们将学习如何将FastAPI与真实数据库连接起来。

## 1.5. part 5 异步数据库操作

这边咕咕掉了
