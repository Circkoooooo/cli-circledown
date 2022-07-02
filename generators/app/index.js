const generators = require('yeoman-generator')
const chalk = require("chalk")
const fs = require("fs")
//是否circleblog
//--//是->读取circle-blog的文件名称【默认为blog.json】
//请输入md标题
//请输入作者

module.exports = class extends generators {
	constructor(args, opts) {
		super(args, opts)
		this.answers = {}
		console.log('\n', chalk.green("『CircleDown - A Blog Cli With OneCircle Blog』"), "\n")
	}
	save(obj) {
		Object.assign(this.answers, obj)
	}

	async prompting() {
		return await this.prompt([
			{
				type: 'confirm',
				name: 'isCircleBlog',
				message: 'Is circleBlog content will you build？',
				default: true,

			},
			// 标题内容
			{
				type: 'input',
				name: 'mdTitle',
				message: 'title',
				default: 'title',

			},
			{
				type: 'input',
				name: 'mdAuthor',
				message: 'author',
				default: "author"
			},
			{
				type: "checkbox",
				name: "mdTag",
				message: "tag [you can add addtional tags after done building]",
				choices: ["vue", "typescript", "react", "git", "nodejs", "前端工程化", "javascript"]
			}
		]).then(answers => {
			this.save(answers)
			// 填充当前时间mdTime到mdTitle
			const time = new Date().toLocaleString()
			this.answers.mdTime = time
			return this.answers
		})
	}

	async writing() {
		let destDir = this.destinationRoot() //命令运行的目录
		const mdTemp = `# ${this.answers.mdTitle}

> ${this.answers.mdTime}

<!-- >从这里开始输入你的内容 -->

> 该文档由circledown cli生成。
		`

		// 判断是否需要读取blog.json文件
		if (this.answers.isCircleBlog) {
			const exist = this.fs.exists(this.destinationPath("blog.json"))

			if (!exist) {
				await this.fs.copyAsync(this.templatePath("jsons"), destDir, this.answers)
			}
			const json = this.fs.readJSON(this.destinationPath("blog.json"))
			// 在读取的json里面查看是否已经包含对应标题的内容
			const existList = json.filter(item => {
				return item.title === this.answers.mdTitle
			})
			if (existList.length !== 0) {
				console.log(chalk.red.bold('blog.json中存在标题为[' + this.answers.mdTitle + ']的内容，创建失败。'))
				return
			}
			if (fs.existsSync(this.destinationPath("blog.json"))) {
				// 要覆盖文件，为了没有额外提示，先删除再创建
				await fs.unlink(this.destinationPath("blog.json"), (err) => {
					if (err) throw err;
				})
			}
			json.push({
				title: this.answers.mdTitle,
				detail: "",
				time: this.answers.mdTime,
				tag: this.answers.mdTag.length === 0 ? [] : this.answers.mdTag
			})
			this.fs.writeJSON(this.destinationPath("blog.json"), json)
		}
		const isMds = fs.existsSync(this.destinationPath("mds"))
		if (!isMds) {
			await fs.mkdir(this.destinationPath("mds"), err => {
				if (err) {
					throw err
				}
			})
		}
		const isBlogMd = fs.existsSync(this.destinationPath("mds", this.answers.mdTitle + '.md'))
		if (isBlogMd) {
			this.log.err('存在【' + this.answers.mdTitle + '.md】的文件')
			return
		}
		fs.writeFile(this.destinationPath("mds/" + this.answers.mdTitle + '.md'), mdTemp, (err) => {
			if (err) {
				throw err
			}
		})
	}
	end() {
		this.log.ok("成功创建【" + this.answers.mdTitle + '】')
	}
}
