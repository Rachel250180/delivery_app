# Be sure to restart your server when you modify this file.

# Define an application-wide content security policy.
# See the Securing Rails Applications Guide for more information:
# https://guides.rubyonrails.org/security.html#content-security-policy-header

Rails.application.configure do
  config.content_security_policy do |policy|
    policy.default_src :self
    policy.script_src  :self, :unsafe_inline,
                       "https://maps.googleapis.com",
                       "https://maps.gstatic.com",
                       "https://cdn.jsdelivr.net",
                       "https://kit.fontawesome.com"
    policy.style_src   :self, :unsafe_inline,
                       "https://fonts.googleapis.com",
                       "https://ka-f.fontawesome.com"
    policy.img_src     :self, :data, :blob,
                       "https://maps.googleapis.com",
                       "https://maps.gstatic.com",
                       "https://streetviewpixels-pa.googleapis.com"
    policy.font_src    :self,
                       "https://fonts.gstatic.com",
                       "https://ka-f.fontawesome.com"
    policy.connect_src :self,
                       "https://maps.googleapis.com",
                       "https://ka-f.fontawesome.com"
    policy.object_src  :none
    policy.base_uri    :self
    policy.form_action :self
  end

  # Start by observing violations without blocking existing functionality.
  config.content_security_policy_report_only = true
end
