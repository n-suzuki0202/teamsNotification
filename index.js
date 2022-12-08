const axios  = require('axios');

const 
  URI         = 'webhookURL',
  BACKLOG_URI = 'https://xxx.backlog.com/';

exports.handler = async event => {
  const 
    bl_body     = JSON.parse(event.body),
    bl_type     = bl_body.type,
    payload_dic = handleIssue(bl_body);

  if (payload_dic !== null) {
    await axios.post(URI, payload_dic);
    return 'success';
  }
  return `unknown event type: ${bl_type}`;
};


const create_title = body => {
  const { createdUser, content } = body;

  switch(body.type) {
    case 1:
      return `${createdUser.name}が「${content.summary}」を追加しました。`;
    case 2:
    case 3:
      return `${createdUser.name}が「${content.summary}」を更新しました。`;
    case 4:
      return `${createdUser.name}が課題を削除しました。`;
    case 6:
      return `${createdUser.name}がWikiを更新しました。`;
    case 14:
      return `${createdUser.name}が課題をまとめて更新しました。`;
    case 17:
      return `${createdUser.name}がコメントにお知らせを追加しました。`;
  }
  return `unknown event type: ${body.type}`;
}

const create_text = body => {
  const { content, created, type } = body;
  const { summary, description, comment } = content;

  switch(type) {
    case 1:
    case 2:
      return `[課題に移動(WEBページに遷移)](${create_link(body)})<br/>件名：${summary}<br/>課題の詳細：${description}<br/>日時：${created}<br />`;
    case 3:
      return `[課題に移動(WEBページに遷移)](${create_link(body)})<br/>件名：${summary}<br/>コメント：${comment.content}<br/>日時：${created}`;
    case 4:
      return `[課題に移動(WEBページに遷移)](${create_link(body)})<br/>日時：${created}`;
    case 14:
      return issue_multi_update(body);
    case 17:
      return `[課題に移動(WEBページに遷移)](${create_link(body)})<br/>件名：${summary}<br/>課題の詳細：${comment.content}<br/>日時：${created}`;
  }
  return `unknown event type: ${type}`;
}

const create_link = body => {
  const { key_id, comment } = body.content;
  let link = `${BACKLOG_URI}view/${body.project.projectKey}-${key_id}`;
  if (comment && comment.id) {
    link += "#comment-" + comment.id;
  }
  return link;
}

const create_links = links => {
  const urls = [];
  links.forEach(link => {
    urls.push(create_link(link));
  });
  return urls;
}

// 課題複数更新時のメッセージ作成
const issue_multi_update = body => {
  const 
    created = body.created,
    test = body.content.link?.length,
    teams_title = create_title(body);

  let teams_text = create_links(body.content.link).join("<br/>");
  for (let i = 0; i < test; i++) {
      teams_text += `件名：${body.content.link[i].title}<br/>`;
  }
  
  teams_text += `日時：${created}<br/>`;

  // Teamsへの通知本文
  const payload_dic = {
      "title": teams_title,
      "text": teams_text,
  }
  return payload_dic;
}

const handleIssue = body => ({
  "title": create_title(body),
  "text": create_text(body),
});