module CommentsHelper
  def linked_comment(text)
    Rinku.auto_link(
      h(text),
      :all,
      'target="_blank" rel="noopener noreferrer nofollow"'
    ).html_safe
  end
end
