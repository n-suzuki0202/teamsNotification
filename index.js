const axios  = require('axios');

exports.handler = async event => {
  const 
    uri = 'teamsURL',
    bl_body = JSON.parse(event.body),
    bl_issue_type = { 1: "課題の追加", 2: "課題の更新", 3: "課題にコメント", 4: "課題の削除", 14: "課題をまとめて更新", 17: "コメントにお知らせを追加" },
    bl_type = bl_body.type;

  let teams_title = '';
  for (let key of Object.keys(bl_issue_type)) {
    if (bl_type == key) {
      teams_title = bl_issue_type[bl_type];
    }
  }

  let payload_dic = {};
  if (bl_type == 1 || bl_type == 2) {
    payload_dic = issue_add(teams_title, bl_body);
  } else if (bl_type == 3) {
    payload_dic = issue_comment(teams_title, bl_body);
  } else if (bl_type == 4) {
    payload_dic = issue_delete(teams_title, bl_body);
  } else if (bl_type == 14) {
    payload_dic = issue_multi_update(teams_title, bl_body);
  } else if (bl_type == 17) {
    payload_dic = issue_comment_notice_add(teams_title, bl_body);
  }

  await axios.post(uri, payload_dic);
  return 'success';
};


// 課題add, update時のメッセージ作成
const issue_add = (teams_title, bl_body) => {
  const 
    bl_summary = bl_body.content.summary,
    bl_description = bl_body.content.description,
    bl_created = bl_body.created;
  
  let teams_text = `件名：${bl_summary}<br/>課題の詳細：${bl_description}<br/>日時：${bl_created}`;
  // Teamsへの通知本文作成
  const payload_dic = {
      "title": teams_title,
      "text": teams_text,
  };

  return payload_dic;
}

// 課題コメント時のメッセージ作成
const issue_comment = (teams_title, bl_body) => {
  const 
    bl_summary = bl_body.content.summary,
    bl_comment = bl_body.content.comment.content,
    bl_created = bl_body.created;
    
  let teams_text = `件名：${bl_summary}<br/>コメント：${bl_comment}<br/>日時：${bl_created}`;
  // Teamsへの通知本文
  const payload_dic = {
      "title": teams_title,
      "text": teams_text,
  };
  return payload_dic;
}

// 課題削除時のメッセージ作成
const issue_delete = (teams_title, bl_body) => ({ "title": teams_title, "text": `日時：${bl_body.created}` });

// 課題複数更新時のメッセージ作成
const issue_multi_update = (teams_title, bl_body) => {
  const 
    bl_created = bl_body.created,
    testt = bl_body.content.link.length;

  let teams_text = "";
  for (let i = 0; i < testt; i++) {
      console.log(bl_body.content.link[i].title);
      teams_text += `件名：${bl_body.content.link[i].title}<br/>`;
  }
  
  teams_text += `日時：${bl_created}`;

  // Teamsへの通知本文
  const payload_dic = {
      "title": teams_title,
      "text": teams_text,
  }
  return payload_dic;
}

// コメントお知らせ追加時のメッセージ作成
const issue_comment_notice_add = (teams_title, bl_body) => {
  const 
    bl_summary = bl_body.content.summary,
    bl_comment = bl_body.content.comment.content,
    bl_created = bl_body.created;
  
  let  teams_text = `件名：${bl_summary}<br/>課題の詳細：${bl_comment}<br/>日時：${bl_created}`;
  // Teamsへの通知本文作成
  const payload_dic = {
      "title": teams_title,
      "text": teams_text,
  }
  return payload_dic; 
}