// 文章的处理函数模块
const { resolve } = require('path')
const path = require('path')
const db = require('../db/index')

// 发布文章的处理函数
exports.addArticle = (req, res) => {
  console.log(req.file)
  if (!req.file || req.file.fieldname !== 'cover_img') return res.cc('文章封面是必选参数！')
  // 处理文章的信息对象
  const articleInfo = {
    // 标题、内容、发布状态、所属分类的Id
    ...req.body,
    // 文章封面的存放路径
    cover_img: path.join('/uploads', req.file.filename),
    // 文章的发布时间
    pub_date: new Date(),
    // 文章作者的Id
    author_id: req.user.id,
  }
  const sql = `insert into ev_articles set ?`
  db.query(sql, articleInfo, (err, results) => {
    if (err) {
      console.log(err)
      return res.cc(err)
    }
    if (results.affectedRows !== 1) return res.cc('发布新文章失败！')
    res.cc('发布文章成功！', 0)
  })
}
// 获取所有文章列表
exports.getArticles = (req, res) => {
  // 定义查询文章列表数据的 SQL 语句
  let sql = `select * from ev_articles where is_delete=0 `
  if (req.query['cate_id'] && req.query.cate_id.trim() !== '') {
    sql += `and cate_id = ? `
  }
  if (req.query['state'] && req.query.state.trim() !== '') {
    sql += 'and state = ? '
  }
  sql += `order by Id asc`
  // 获得当前分页的数据
  const start = (parseInt(req.query.pagenum) - 1) * parseInt(req.query.pagesize)
  const end = (parseInt(req.query.pagenum) - 1) * parseInt(req.query.pagesize) + parseInt(req.query.pagesize)
  db.query(sql, [req.query.cate_id, req.query.state], (err, results) => {
    if (err) return res.cc(err)
    const final = results.slice(start, end)
    // 将数据中的cate_id转换为cate_name
    const sqlstr = 'select * from ev_article_cate where is_delete=0'
    db.query(sqlstr, (err, val) => {
      if (err) res.cc(err)
      for (let i of results) {
        for (let item of val) {
          if (i.cate_id === item.Id) {
            i.cate_name = item.name
            break
          }
        }
      }
      res.send({
        status: 0,
        message: '获取文章数据成功！',
        data: final,
        total: results.length
      })
    })

  })

}
// 删除文章
exports.deleteArticle = (req, res) => {
  // 定义删除的 SQL 语句
  const sql = `delete from ev_articles where id=?`
  db.query(sql, req.params.id, (err, results) => {
    if (err) return res.cc(err)
    if (results.affectedRows !== 1) return res.cc('删除文章失败！')
    res.cc('删除文章成功！', 0)
  })
}
// 根据Id获取文章
exports.getArticle = (req, res) => {
  // 定义根据 ID 获取文章分类数据的 SQL 语句
  const sql = `select * from ev_articles where id=?`
  db.query(sql, req.params.id, (err, results) => {
    if (err) return res.cc(err)
    if (results.length !== 1) return res.cc('获取文章分类数据失败！')
    res.send({
      status: 0,
      message: '获取文章分类数据成功！',
      data: results[0],
    })
  })
}
// 更新文章的处理函数
exports.updataarticle = (req, res) => {
  // 定义查询文章列表数据的 SQL 语句
  let sql = `update ev_articles set ? where Id=? `
  db.query(sql, [req.body,req.body.Id], (err, results) => {
    if(err) res.cc(err)
    if(results.affectedRows!==1) res.cc('更新文章失败')
    res.cc('更新数据成功',0)
  })
}